# NutriTrack

Modern web diet & nutrition tracker with AI meal logging. Built as a free-tier MVP.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind + shadcn/ui
- **Supabase** free tier — Auth + Postgres + RLS
- **Gemini 2.0 Flash** (Google AI Studio free key) — natural-language meal parsing
- **TanStack Query** + **Recharts**

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Apply the schema (pick one):
   - **SQL Editor:** run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)
   - **CLI (linked project):** `npm run db:push`
3. Under **Authentication → Providers → Email**: enable Email; turn **Confirm email** off
4. Under **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`
5. Copy **Project URL** and **anon/publishable key** from Project Settings → API

Auth is passwordless **magic-link** email (click the link to sign in). Sessions persist until the user clicks **Sign out**.

### Connect Supabase in Cursor (MCP + CLI)

1. Create a **Personal Access Token**: [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Copy [`.cursor/mcp.json.example`](.cursor/mcp.json.example) → `.cursor/mcp.json` and paste the token into `SUPABASE_ACCESS_TOKEN`
3. In Cursor: **Settings → MCP**, enable the `supabase` server (green when connected)
4. Link the CLI (one-time):

```bash
npx supabase login
npx supabase link --project-ref aegxlcocnezddlmaqpam
```

Useful scripts:

```bash
npm run db:push      # push migrations to remote
npm run db:pull      # pull remote schema
npm run supabase     # run any supabase CLI command, e.g. npm run supabase -- status
```

### 3. Gemini (free)

1. Get an API key at [Google AI Studio](https://aistudio.google.com/apikey)
2. Use the free quota for `gemini-2.0-flash`

### 4. Env

```bash
cp .env.local.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
```

Restart `npm run dev` after changing env vars.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Email magic-link auth (passwordless, free-tier friendly) + onboarding (Mifflin–St Jeor goal suggestions)
- Dashboard: today’s calories, macros, water, meals
- AI meal logging with editable nutrition preview
- Meal history by date
- Analytics (7/30-day calorie, protein, weight)
- Goals, weight tracking, settings/profile

## Deploy (optional)

Deploy to [Vercel](https://vercel.com) Hobby and add the same env vars in the project settings.
