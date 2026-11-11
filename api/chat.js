/* ============================================================
   Vercel serverless function — Groq proxy  (CommonJS)
   ------------------------------------------------------------
   Keeps the Groq API key server-side (never exposed to the
   browser). The front-end posts to /api/chat and this function
   forwards the request to Groq.

   Environment variables (Vercel dashboard → Settings → Env Vars):
     GROQ_API_KEY   gsk_...                      (required)
     GROQ_MODEL     llama-3.3-70b-versatile       (optional)
   ============================================================ */

module.exports = async function handler(req, res) {
  /* ---- CORS headers (allow the browser to call this endpoint) ---- */
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
    console.error("[chat] GROQ_API_KEY is not set.");
    return res.status(503).json({
      error: "Chat service is not configured. Please contact the site owner.",
    });
  }

  /* ---- Parse body (Vercel auto-parses JSON when Content-Type is application/json) ---- */
  let body = req.body;

  /* Fallback: manually parse if body is still a string */
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }

  const messages = (body && Array.isArray(body.messages)) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }

  /* ---- Forward to Groq ---- */
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.4,
      }),
    });

    let data;
    try {
      data = await groqRes.json();
    } catch (_) {
      data = {};
    }

    if (!groqRes.ok) {
      const errMsg = (data && data.error && data.error.message) || ("HTTP " + groqRes.status);
      console.error("[chat] Groq error:", errMsg);
      return res.status(groqRes.status).json({ error: errMsg });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("[chat] Fetch error:", err.message);
    return res.status(502).json({
      error: "Failed to reach the AI service. Please try again.",
    });
  }
};
