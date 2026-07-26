# NutriTrack

**Log meals in plain English. Track calories, macros, water, and weight — without the friction.**

NutriTrack is a modern web app for everyday diet tracking. Describe what you ate (“2 roti, 1 cup dal, 2 pieces chicken fry”), review AI nutrition estimates, edit anything, and save. Tuned for Indian-style meals and a clean daily workflow.

## Features

- **Magic-link sign-in** — passwordless email auth; stay signed in until you sign out
- **Smart onboarding** — profile setup with calorie and macro goal suggestions (Mifflin–St Jeor)
- **Today dashboard** — calorie ring, protein/carbs/fat progress, water intake, and meals
- **AI meal logging** — natural-language parse with an editable nutrition preview, plus manual entry
- **History** — browse any day and log meals for past dates
- **Analytics** — 7- and 30-day trends for calories, protein, and weight
- **Goals, weight & settings** — targets, weigh-ins, and profile management

## How meal logging works

1. Type a meal in natural language — or enter nutrition manually  
2. AI estimates items and macros  
3. Edit the preview table as needed  
4. Save to the selected date — it appears on the dashboard, history, and analytics  

## Built with

| Layer | Tech |
| --- | --- |
| App | Next.js · TypeScript · Tailwind CSS · shadcn/ui |
| Auth & database | Supabase (Auth, Postgres, RLS) |
| AI | Gemini 3.5 Flash-Lite |
| Client data | TanStack Query · Recharts |
