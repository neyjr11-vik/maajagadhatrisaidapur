# 🪔 Maa Jagadhatri Pooja, Saidapur

Official website for the **Maa Jagadhatri Pooja** celebrated every year since **1901** by the Kamlakant Jha family at Saidapur, Godda district, Jharkhand, India.

🌐 **Live site:** [maajagadhatrisaidapur.vercel.app](https://maajagadhatrisaidapur.vercel.app)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 Cinematic design | Dark-gold theme, GSAP scroll animations, Ken Burns hero |
| ⏱ Live countdown | Counts down to Maha Saptami (17 Nov 2026, IST) |
| 📖 Story chapters | Pinned scroll-through of the 1901 origin story |
| 🖼 Gallery + lightbox | Devotional photos with full-screen preview |
| ❓ FAQ accordion | Eight common devotee questions answered |
| 🗺 Directions | Embedded Google Maps link to Saidapur Mandir |
| 📬 Contact form | Opens a pre-filled email to the organisers |
| 🤖 AI chat assistant | Groq-powered chatbot with knowledge of the pooja |
| 🔐 Secure API proxy | Groq key lives only in Vercel env vars — never in the browser |
| 📱 Fully responsive | Mobile-first, works on all screen sizes |
| ♿ Accessible | ARIA labels, keyboard nav, reduced-motion support |
| 🔍 SEO-ready | Canonical tags, Open Graph, Twitter Card, Schema.org JSON-LD |

---

## 🗂 Project Structure

```
jp1/
├── index.html                  # Single-page app (all sections)
├── vercel.json                 # Vercel deployment config
├── sitemap.xml                 # For search engines
├── robots.txt                  # Crawler rules + llms.txt pointer
├── llms.txt                    # AI crawler-friendly site summary
│
├── api/
│   └── chat.js                 # ✅ Vercel serverless proxy (keeps API key secret)
│
├── assets/
│   ├── css/
│   │   └── style.css           # All styles (dark-gold theme)
│   ├── js/
│   │   ├── config.js           # Chat config (proxy URL — no API key!)
│   │   ├── main.js             # Nav, countdown, story scroll, lightbox
│   │   └── chat.js             # Floating AI assistant widget
│   └── images/
│       ├── banner/             # Hero, story, services images
│       ├── gallery/            # Devotional gallery photos
│       └── logo/               # Site logo
│
├── .env                        # 🔒 Local secrets (git-ignored)
├── .env.example                # Template — copy to .env to get started
└── .gitignore
```

---

## 🤖 AI Chat Assistant

The floating chat button (bottom-right) lets devotees ask questions about the pooja — dates, story, rituals, directions, and more.

### How it works (securely)

```
Browser (chat.js)
    │  POST /api/chat  { messages: [...] }   ← no API key in browser
    ▼
Vercel Function (api/chat.js)
    │  reads GROQ_API_KEY from env vars (server-side only)
    │  POST https://api.groq.com/...
    ▼
Groq API  →  LLaMA 3.3 70B
```

The Groq API key is **never shipped to the browser** — it lives only in Vercel's environment variables.

---

## 🚀 Deploy to Vercel

### 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2 — Import on Vercel

Go to [vercel.com/new](https://vercel.com/new), import your GitHub repo.  
Vercel will auto-detect the `api/` folder as serverless functions.

### 3 — Add the environment variable

In the Vercel dashboard:  
**Project → Settings → Environment Variables**

| Name | Value |
|---|---|
| `GROQ_API_KEY` | `gsk_your_key_here` |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` *(optional)* |

> Get a free Groq key at [console.groq.com/keys](https://console.groq.com/keys)

### 4 — Redeploy

Trigger a redeploy after adding the env vars — the chat assistant will be live. ✅

---

## 💻 Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Vercel CLI](https://vercel.com/docs/cli)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/neyjr11-vik/maajagadhatrisaidapur.git
cd YOUR_REPO

# 2. Install Vercel CLI globally
npm install -g vercel

# 3. Copy env template and fill in your Groq key
cp .env.example .env
# Edit .env → set GROQ_API_KEY=gsk_your_key_here

# 4. Start local dev server (reads .env automatically)
vercel dev
```

The site will be at **http://localhost:3000** and the proxy at **http://localhost:3000/api/chat**.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Front-end | Vanilla HTML5, CSS3, JavaScript (ES2020) |
| Animations | [GSAP 3](https://gsap.com/) + ScrollTrigger |
| Fonts | Google Fonts — Cormorant Garamond, Inter, Tiro Devanagari Sanskrit |
| AI model | [Groq](https://groq.com/) · LLaMA 3.3 70B Versatile |
| Serverless | Vercel Functions (Node.js 18) |
| Hosting | [Vercel](https://vercel.com/) |

---

## 📅 2026 Pooja Schedule

| Date | Day | Event |
|---|---|---|
| 17 Nov 2026 | Tuesday | **Maha Saptami** — festivities begin |
| 18 Nov 2026 | Wednesday | **Maha Ashtami** — grand fair opens |
| 19 Nov 2026 | Thursday | **Maha Navami** (Akshaya Navami) — Trikala Pooja & Havan |
| 20 Nov 2026 | Friday | **Visarjan** (Ekadashi) — procession & immersion in Kajhiya river |

---

## 📬 Contact

**Email:** [maajagadhatrisaidapur@gmail.com](mailto:maajagadhatrisaidapur@gmail.com)  
**Location:** Maa Jagadhatri Mandir, Saidapur, District Godda, Jharkhand – 814133, India

---

<div align="center">

।।अथश्री जगद्धात्री देव्यै नमः।।

**© 2026 Kamlakant Jha Family, Saidapur · Jai Maa Jagat Janani**

</div>

