/* ============================================================
   Maa Jagadhatri Pooja, Saidapur — chat config
   ------------------------------------------------------------
   The Groq API key is NEVER stored here (or anywhere in the
   browser). It lives only in the server-side environment
   variable GROQ_API_KEY, which is read by the Vercel
   serverless function at api/chat.js.

   To run locally: install Vercel CLI and run `vercel dev`.
   The proxy will be available at http://localhost:3000/api/chat.
   ============================================================ */

const CHAT_CONFIG = {
  /* Proxy endpoint — routes through the Netlify function so the
     API key is never exposed to the browser.                    */
  proxyUrl: "/api/chat",

  assistantName: "Saidapur Sewa · AI Assistant"
};
