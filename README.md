# Estate AI - Real Estate Listings Platform

A full-featured property listings web app built with Next.js 16 (App Router), Supabase (Postgres + Auth), Leaflet maps, and Resend email. Browsable listings with advanced filters, an interactive price map, property detail pages with reviews and inquiries, user accounts with saved listings, and a full admin dashboard.

This README is for the **client** who will run, configure, and deploy the project.

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Supabase (Postgres database, Auth, Row Level Security)
- Leaflet (interactive maps, no API key needed)
- Resend (transactional email for inquiries)
- Vercel (recommended hosting)

## Prerequisites

- Node.js 20.18+ and npm
- A free [Supabase](https://supabase.com) account
- A free [Resend](https://resend.com) account (only needed for inquiry emails)
- A GitHub account and (optionally) a [Vercel](https://vercel.com) account

## Local Setup

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd estate-ai
   npm install
   ```

2. Create your environment file by copying the example:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in the values in `.env.local` (see Environment Variables below).

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Environment Variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only, never expose) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL (e.g. http://localhost:3000 or your production domain) |
| `RESEND_API_KEY` | No | Resend API key for inquiry notification emails |
| `INQUIRY_TO_EMAIL` | No | Destination email for inquiry notifications |

The app runs with placeholder values but will show no listings until Supabase is connected.

## Supabase Setup

1. Create a new Supabase project.
2. In the Supabase SQL editor, run the contents of `supabase/schema.sql`. This creates the tables (`profiles`, `listings`, `reviews`, `bookmarks`, `saved_searches`, `inquiries`, `agents`), row level security policies, rating recalculation triggers, and a storage bucket for listing images.
3. Copy your project URL and keys from Project Settings > API into `.env.local`.
4. (Optional) Seed sample data:

   ```bash
   npm run seed
   ```

   This inserts 10,000 sample listings for testing filters and the map.

## Admin Access

The admin dashboard lives at `/admin`. To grant a user admin rights, set their `role` to `admin` in the `profiles` table (the schema defaults new users to `user`). Admins can manage listings, agents, users, view analytics, and bulk-import listings via CSV.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repository.
3. Set the same environment variables from `.env.example` in the Vercel project settings.
4. Deploy. The build command (`npm run build`) and output are handled automatically.

A live production build is already running at https://ai-real-estate-listings.vercel.app.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm run seed` | Insert 10k sample listings into Supabase |

## Project Structure

- `src/app` - Pages and API routes (home, listings, detail, auth, admin, account)
- `src/components` - Reusable UI (cards, filters, map, forms, admin)
- `src/lib` - Supabase clients, query builders, filters, types
- `supabase/schema.sql` - Database schema and security policies
- `scripts/seed.ts` - Sample data generator

## Support

For setup help, see `HANDOFF.md` (developer handover notes) in the repo, or contact the developer.
