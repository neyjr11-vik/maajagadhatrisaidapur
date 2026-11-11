/* ============================================================
   Maa Jagadhatri Pooja, Saidapur — chat.js
   Floating AI assistant — calls the /api/chat proxy
   (Groq API key is kept server-side in an env variable)
   ============================================================ */
(function () {
  "use strict";

  var fab = document.getElementById("chatFab");
  var panel = document.getElementById("chatPanel");
  var closeBtn = document.getElementById("chatClose");
  var navChatBtn = document.getElementById("navChatBtn");
  var log = document.getElementById("chatLog");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  var chipsBox = document.getElementById("chatChips");

  /* Proxy URL from config (never an API key in the browser) */
  var proxyUrl = (typeof CHAT_CONFIG !== "undefined" && CHAT_CONFIG.proxyUrl)
    ? CHAT_CONFIG.proxyUrl
    : "/api/chat";

  var SYSTEM_PROMPT =
    "You are the warm, respectful AI assistant on the official website of Maa Jagadhatri Pooja, Saidapur — a family pooja celebrated since 1901 by the Kamlakant Jha family at Saidapur, Godda district, Jharkhand, India.\n" +
    "Answer only using the facts below; if something is not covered, politely say so and point to maajagadhatrisaidapur@gmail.com.\n\n" +
    "FACTS:\n" +
    "- 2026 dates: Maha Saptami 17 Nov, Maha Ashtami 18 Nov, Maha Navami 19 Nov; Visarjan (immersion) on Ekadashi 20 Nov 2026.\n" +
    "- Venue: Maa Jagadhatri Mandir, Saidapur, District Godda, Jharkhand - 814133, India.\n" +
    "- History: celebrated every year since 1901, commemorating the birth of Late Kamlakant Jha (1900-1968), son of Late Heera Jha, a barrister who graduated from Kolkata University in 1882. Heera Jha vowed at the Chandannagar Jagadhatri Pooja that if blessed with a son he would worship the Goddess yearly; a flower fell into Mrs. Jha's lap during immersion, Kamlakant Jha was born in 1900, and worship began at Saidapur in 1901. Kamlakant Jha had six sons (Krishna Kant, Vishnu Kant, Nishi Kant, Avni Kant, Saroj Kant, Shyama Kant Jha) and a daughter (Sharda Devi).\n" +
    "- Maa Jagadhatri represents power and peace, rides a lion, blesses devotees with offspring; the pooja process is Tantrik.\n" +
    "- Rituals: on Maha Navami (Akshaya Navami) Trikala Pooja runs from morning with Havan afterwards; the Acharya distributes offered flowers to devotees on Sanyam (fasting with a wish). The fair includes stalls, Ferris wheels and pirate boats; police are present for safety.\n" +
    "- Immersion: idols are immersed in the Kajhiya river on Ekadashi with a grand procession (a tradition that began over a decade ago after a divine rainstorm delayed a Dashami-night immersion). After immersion, juniors bow to elders for blessings.\n" +
    "- Contact: maajagadhatrisaidapur@gmail.com. The pooja unites the region and connects people to their roots.\n\n" +
    "Style: concise (under 120 words unless asked for detail), warm and devotional, plain text, use simple English. End with 'Jai Maa Jagadhatri!' occasionally (not every message). Reply in the language the visitor writes in (English or Hindi).";

  var SUGGESTIONS = [
    "What are the 2026 pooja dates?",
    "How do I reach Saidapur?",
    "What happens on Maha Navami?",
    "Tell me the story of this pooja"
  ];

  var messages = [];
  var opened = false;

  /* ---------- Open / Close ---------- */
  function open() {
    panel.hidden = false;
    requestAnimationFrame(function () {
      panel.classList.add("is-open");
      fab.classList.add("is-open");
      fab.setAttribute("aria-expanded", "true");
    });
    if (!opened) {
      opened = true;
      greeting();
    }
    setTimeout(function () { input.focus(); }, 300);
  }
  function close() {
    panel.classList.remove("is-open");
    fab.classList.remove("is-open");
    fab.setAttribute("aria-expanded", "false");
    setTimeout(function () { panel.hidden = true; }, 300);
  }

  fab.addEventListener("click", function () {
    panel.classList.contains("is-open") ? close() : open();
  });
  if (navChatBtn) navChatBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("is-open")) close();
  });

  /* ---------- Message helpers ---------- */
  function addMsg(text, who) {
    var div = document.createElement("div");
    div.className = "msg msg--" + who;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function greeting() {
    addMsg(
      "🙏 Namaste! I'm the AI assistant for Maa Jagadhatri Pooja, Saidapur.\n\n" +
      "Ask me about the pooja dates (17–20 Nov 2026), how to reach us, the story since 1901, or any ritual.",
      "ai"
    );
    SUGGESTIONS.forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", function () {
        input.value = q;
        form.dispatchEvent(new Event("submit"));
      });
      chipsBox.appendChild(b);
    });
  }

  /* ---------- Typing indicator ---------- */
  var typingEl = null;
  function showTyping() {
    typingEl = addMsg("Maa's blessings… thinking ✨", "ai typing");
    typingEl.classList.add("msg--typing");
  }
  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  /* ---------- Call the server-side proxy ---------- */
  async function callProxy(msgs) {
    var res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs })
    });

    var data;
    try { data = await res.json(); } catch (_) { data = {}; }

    if (!res.ok) {
      var errMsg = (data && data.error) || ("HTTP " + res.status);
      throw new Error(errMsg);
    }

    var reply = data.choices && data.choices[0] &&
                data.choices[0].message && data.choices[0].message.content;
    if (!reply) throw new Error("Empty reply from model.");
    return reply.trim();
  }

  /* ---------- Submit handler ---------- */
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = "";

    addMsg(q, "user");
    messages.push({ role: "user", content: q });

    var sendBtn = form.querySelector("button");
    sendBtn.disabled = true;
    showTyping();

    try {
      /* Prepend system prompt on every call */
      var payload = [{ role: "system", content: SYSTEM_PROMPT }].concat(messages);
      var reply = await callProxy(payload);
      hideTyping();
      addMsg(reply, "ai");
      messages.push({ role: "assistant", content: reply });
    } catch (err) {
      hideTyping();
      var userMsg = "Sorry — the assistant couldn't answer just now. Please try again, or email maajagadhatrisaidapur@gmail.com 🙏";

      /* Surface specific error types clearly */
      if (err.message) {
        var m = err.message.toLowerCase();
        if (m.includes("not configured") || m.includes("503")) {
          userMsg = "⚙️ The AI assistant isn't set up on this server yet. Please email maajagadhatrisaidapur@gmail.com 🙏";
        } else if (m.includes("api key") || m.includes("401") || m.includes("403")) {
          userMsg = "⚠️ API key issue — the Groq key may be invalid or expired. Please contact the site owner.";
        } else if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("502")) {
          userMsg = "🌐 Network error — please check your connection and try again.";
        }
      }
      addMsg(userMsg, "ai");
      console.error("Chat error:", err.message);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  });
})();
