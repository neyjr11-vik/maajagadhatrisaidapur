/* ============================================================
   Maa Jagadhatri Pooja, Saidapur — Vercel serverless proxy
   ------------------------------------------------------------
   Keeps the Groq API key server-side (never exposed to client).
   The front-end posts to /api/chat.

   Environment variables (Vercel Dashboard → Project Settings → Environment Variables):
     GROQ_API_KEY   gsk_...
     GROQ_MODEL     llama-3.3-70b-versatile  (optional)
   ============================================================ */

module.exports = async function handler(req, res) {
  /* CORS headers */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  /* Pre-flight check */
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  /* Diagnostic GET endpoint to verify function is deployed & configured */
  if (req.method === "GET") {
    const isConfigured = Boolean(process.env.GROQ_API_KEY);
    return res.status(200).json({
      status: "ok",
      configured: isConfigured,
      message: isConfigured
        ? "AI chat proxy is active and ready."
        : "GROQ_API_KEY environment variable is missing in Vercel project settings."
    });
  }

  /* Only allow POST for completions */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  /* Verify environment variable is present */
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[chat] GROQ_API_KEY environment variable is missing.");
    return res.status(503).json({
      error: "Chat service is not configured. Please ensure GROQ_API_KEY is set in Vercel environment variables.",
    });
  }

  /* Parse incoming messages */
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = {};
    }
  }

  const messages = body && Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey.trim(),
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
      const errMsg =
        (data && data.error && (typeof data.error === "string" ? data.error : data.error.message)) ||
        `Groq HTTP ${groqRes.status}`;
      console.error("[chat] Groq API returned error:", errMsg);
      return res.status(groqRes.status).json({ error: errMsg });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("[chat] Network error while calling Groq:", err.message);
    return res.status(502).json({
      error: "Failed to connect to the AI service: " + err.message,
    });
  }
};
