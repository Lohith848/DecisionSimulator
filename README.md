# Decision Simulator

> See your future before you live it.

A modern, AI-powered web app that simulates best-case, worst-case, and wildcard timelines for any decision you're facing. Powered by Groq LLaMA 3.3 & Google Gemini.

![Type your decision to simulate your future](https://img.shields.io/badge/Status-Active-success) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## Live Features

- **Three timelines** — Best, Worst, and Wildcard outcomes for every decision
- **Roast Mode** — Toggle for extra sass and sarcasm
- **Confidence Meter** — AI-generated probability score (100% not real)
- **Share Card Export** — Download a shareable image of your simulation
- **Local History** — Last 5 decisions stored in browser
- **Modern Glassmorphism UI** — Smooth animations, responsive design

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| AI | Groq SDK + Google Generative AI |
| Image Export | html2canvas |

---

## Installation

### Clone & Setup

```bash
git clone https://github.com/Lohith848/DecisionSimulator.git
cd DecisionSimulator
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

```env
# Groq (LLaMA 3.3 70B) — get from https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Google Gemini — get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run Development Server

```bash
npm run dev
# → http://localhost:3000
```

---

## API

### `POST /api/simulate`

Simulates a decision using AI.

**Request:**

```json
{
  "decision": "Should I quit my job?",
  "roastMode": false
}
```

**Response:**

```json
{
  "category": "Career",
  "confidence_percent": 73,
  "timelines": {
    "best": {
      "title": "You become a senior engineer in 18 months",
      "three_month": "Land a remote role at a startup",
      "one_year": "Promoted to team lead",
      "verdict": "Sometimes the leap is worth it.",
      "vibe": "🚀"
    },
    "worst": {
      "title": "You struggle with motivation for 6 months",
      "three_month": "Burnout hits hard",
      "one_year": "Freelance gigs barely pay rent",
      "verdict": "Your future self is judging you.",
      "vibe": "💀"
    },
    "wildcard": {
      "title": "You accidentally start a cult",
      "three_month": "500 people believe you're the next Steve Jobs",
      "one_year": "Book deal, TED Talk, documentary series",
      "verdict": "Worst best decision ever.",
      "vibe": "🌀"
    }
  },
  "provider": "groq"
}
```

**Notes:**
- Rate-limited to 10 requests per minute per IP
- `confidence_percent` is clamped between 1–99
- If Groq fails, falls back to Gemini
- Roast mode increases sarcasm by 40%

---

## Project Structure

```
app/
  page.tsx           → SinglePageSimulator (main page)
  api/simulate/      → POST simulation endpoint
  results/page.tsx   → Results redirect (legacy)
  simulator/page.tsx → Legacy redirect

components/
  SinglePageSimulator.tsx  Main page container
  DecisionInput.tsx        Input card (shared)
  HistoryDrawer.tsx        Recent decisions list
  TimelineCard.tsx         Best/Worst/Wildcard cards
  ConfidenceMeter.tsx      Progress bar with percentage
  ShareCard.tsx            Export preview + download
  RoastToggle.tsx          Toggle switch component

lib/
  prompt.ts      → AI prompt builder
  categories.ts  → Decision category detector
  storage.ts     → LocalStorage helpers
  groq.ts        → Groq client setup
  gemini.ts      → Gemini client setup
  json.ts        → JSON extraction + clamping
  ratelimit.ts   → In-memory rate limiter
```

---

## Design System

### Colors
- **Primary Blue**: `#0038FF` (background)
- **Accent Yellow**: `#CCFF00` (highlights, badges)
- **Glass base**: `rgba(255, 255, 255, 0.10)` + `backdrop-blur-md`

### Components
- Cards: `rounded-[2rem] border border-white/30 bg-white/10 backdrop-blur-md`
- Buttons: `rounded-full` with scale-on-hover `transition-all duration-300`
- Text: Inter + Arial Black Impact-style headings

---

## Configuration

### Prompt Engineering

The AI prompt is in `lib/prompt.ts`. The `confidence_percent` field is intentionally variable — the model is instructed to assign 50–95 based on decision plausibility.

### Rate Limiting

In-memory per-IP rate limit is 10 requests per 60 seconds (configurable in `app/api/simulate/route.ts`).

### Local Storage

- `decision-sim-history` — last 5 decisions (array of `HistoryItem`)
- `decision-sim-latest` — most recent result (for future features)

---

## Testing

```bash
# Type check (if script exists)
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build
```

---

## License

MIT — feel free to fork, modify, and deploy.

---

## Credits

Built with Next.js, Tailwind CSS, Framer Motion, Groq, and Google Gemini.

## Links

- [Check out](https://use-decision-simulator.vercel.app/)
- [Issues](https://github.com/Lohith848/DecisionSimulator/issues)
- [Pull Requests](https://github.com/Lohith848/DecisionSimulator/pulls)

---

> "Simulating timelines (please don't blink)..." — The Decision Simulator
