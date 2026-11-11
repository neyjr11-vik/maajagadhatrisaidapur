/* ============================================================
   Vercel serverless function — Groq proxy
   ------------------------------------------------------------
   Keeps the Groq API key server-side (never exposed to the
   browser). The front-end posts to /api/chat and this function
   forwards the request to Groq.

   Environment variable required (set in Vercel dashboard under
   Project → Settings → Environment Variables, or in a local
   .env file for `vercel dev`):
     GROQ_API_KEY=gsk_...
     GROQ_MODEL=llama-3.3-70b-versatile   (optional override)
   ============================================================ */

export default async function handler(req, res) {
  /* ---- CORS headers ---- */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  /* ---- Handle CORS pre-flight ---- */
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  /* ---- Only allow POST ---- */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* ---- Guard: API key must be set as an env var ---- */
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not set in environment variables.");
    return res.status(503).json({
      error: "Chat service is not configured. Please contact the site owner.",
    });
  }

  /* ---- Parse and validate the incoming body ---- */
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }

  /* ---- Forward to Groq ---- */
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
        temperature: 0.4,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      const errMsg = data?.error?.message || `HTTP ${groqRes.status}`;
      console.error("Groq API error:", errMsg);
      return res.status(groqRes.status).json({ error: errMsg });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy fetch error:", err.message);
    return res.status(502).json({
      error: "Failed to reach the AI service. Please try again.",
    });
  }
}

