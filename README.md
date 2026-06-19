# BrandOS — AI Brand Builder for African SMEs

> Built by [Ingweplex Business & Branding Consultancy](https://ingweplex.site) · Nairobi, Kenya

BrandOS is an AI-powered brand building platform that guides Kenyan and East African businesses through brand strategy, visual identity, digital marketing, and social media — all in one place.

---

## 🚀 Quick Start (VS Code + Local Dev)

### 1. Install dependencies
```bash
cd brandos
npm install --legacy-peer-deps
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and add your API keys (see Environment Variables below).

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
brandos/
├── src/
│   └── app/
│       ├── page.tsx                    # Landing page
│       ├── layout.tsx                  # Root layout
│       ├── globals.css                 # Global styles + Tailwind
│       ├── login/page.tsx              # Login page
│       ├── signup/page.tsx             # Signup (2-step)
│       └── dashboard/
│           ├── layout.tsx             # Sidebar + navigation
│           ├── page.tsx               # Dashboard home
│           ├── discovery/page.tsx     # Module 1: Brand Discovery (14 questions)
│           ├── strategy/page.tsx      # Module 2: Brand Strategy + AI Coach
│           ├── identity/page.tsx      # Module 3: Visual Identity Generator
│           ├── marketing/page.tsx     # Module 4: 90-Day Marketing Plan
│           ├── content/page.tsx       # Module 5: Content Engine
│           ├── analytics/page.tsx     # Module 6: Analytics Dashboard
│           └── settings/page.tsx      # Account settings + billing
├── .env.local.example                 # Environment variables template
├── next.config.js                     # Next.js config
├── tailwind.config.ts                 # Tailwind config
├── vercel.json                        # Vercel deployment config
└── package.json
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Fonts | Inter + Poppins (Google Fonts) |
| Auth (v2) | Supabase Auth |
| Database (v2) | Supabase (PostgreSQL) |
| AI (v2) | OpenAI GPT-4o API |
| Payments (v2) | Flutterwave (M-Pesa) |
| Deployment | Vercel |

---

## 🌍 Environment Variables

Copy `.env.local.example` to `.env.local`:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
FLUTTERWAVE_PUBLIC_KEY=...
FLUTTERWAVE_SECRET_KEY=...
RESEND_API_KEY=...
```

> The MVP works without API keys — AI responses are simulated. Add real keys when going live.

---

## 🚢 Deploy to Vercel

### Option 1: GitHub + Vercel (Recommended)
1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Add environment variables in Vercel dashboard
5. Click Deploy ✅

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 📱 Pages & Features

| Page | Route | Status |
|------|-------|--------|
| Landing Page | `/` | ✅ |
| Login | `/login` | ✅ |
| Signup (2-step) | `/signup` | ✅ |
| Dashboard Home | `/dashboard` | ✅ |
| Brand Discovery | `/dashboard/discovery` | ✅ |
| Brand Strategy + AI Coach | `/dashboard/strategy` | ✅ |
| Visual Identity | `/dashboard/identity` | ✅ |
| Marketing Plan | `/dashboard/marketing` | ✅ |
| Content Engine | `/dashboard/content` | ✅ |
| Analytics | `/dashboard/analytics` | ✅ |
| Settings + Billing | `/dashboard/settings` | ✅ |

---

## 🎨 Brand Colors

```
Navy:   #0F1D26  (background)
Orange: #F25C05  (primary accent)
Gold:   #D9910B  (secondary accent)
Teal:   #1A7A6E  (success)
```

---

## 📋 Roadmap (v2)

- [ ] Real OpenAI API integration
- [ ] Supabase auth + database
- [ ] M-Pesa payments via Flutterwave
- [ ] PDF export for all documents
- [ ] Social media scheduler
- [ ] Swahili language support
- [ ] Mobile PWA

---

## 📞 Support

**Ingweplex** · Ingweplex@gmail.com · +254 798 936 316 · [Ingweplex.site](https://ingweplex.site)

© 2026 Ingweplex Business & Branding Consultancy. All rights reserved.