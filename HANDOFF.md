# AI Real Estate Listings - Handover

A responsive, SEO-friendly property-listings platform built with Next.js 16 (App Router) + Supabase, with an interactive Leaflet map, advanced filters, auth, reviews, inquiries, and an admin dashboard with bulk import and AI-assisted tools.

## Stack Overview

- **Framework:** Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS v4)
- **Database / Auth:** Supabase Postgres + Supabase Auth (email/password, Google, Apple via OAuth)
- **Maps:** Leaflet + OpenStreetMap (free, no API key). Swappable for Mapbox/Google Maps.
- **Email:** Resend (prospect confirmation + owner notification on inquiries)
- **AI automations:** Stubbed utility for meta-tag/summary generation (wire to OpenAI/Anthropic later). Duplicate detection noted in bulk import.
- **Hosting:** Portable to Vercel / Netlify / Render (zero-config). Static sitemap + manifest included.

## Directory Map

- `src/app/` - routes (home, /listings, /listings/[id], /login, /signup, /account, /saved, /admin/*, /about, /contact, /faq, /privacy, /terms, /api/*)
- `src/components/` - UI (ui.tsx, listing-card, filter-sidebar, listings-map, inquiry-form, reviews-list, bookmark-button, site-header, site-footer)
- `src/lib/` - supabase clients, listings query builder, filters parser, types, auth helpers
- `supabase/schema.sql` - full database schema + RLS policies
- `scripts/seed.ts` - generate 10k sample listings for acceptance tests
- `.env.example` - all required keys (placeholders)

## Local Setup

1. `cp .env.example .env.local` and fill values (see API keys below).
2. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor.
3. Enable Auth providers: Email, Google, Apple (set redirect URL to `/auth/callback`).
4. `npm install`
5. `npm run seed` (needs SUPABASE_SERVICE_ROLE_KEY) to load 10k listings.
6. `npm run dev` -> http://localhost:3000

## Deployment (Vercel)

1. Push repo to GitHub.
2. Import at vercel.com. Set framework = Next.js, build = `npm run build`.
3. Add all env vars from `.env.example` in project settings.
4. Deploy. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
5. Add the production `/auth/callback` URL to Supabase Auth redirect allowlist.

## AI Automations Used

- **Bulk import duplicate detection:** CSV import skips/flags rows whose (title+city+address) already exist.
- **Meta-tag & summary generation:** `/admin/ai` calls a stub that returns an AI-style summary + SEO keywords. Replace the stub with a real LLM call (OpenAI/Anthropic SDK already a dependency) when keys are available.
- **Image URLs:** stored as arrays; map pins and galleries read them directly. (Hook image optimization at upload time in admin form.)

## API Keys Required (placeholders only)

| Key | Where | Used for |
|-----|-------|----------|
| NEXT_PUBLIC_SUPABASE_URL | .env.local | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | .env.local | Public anon key (browser) |
| SUPABASE_SERVICE_ROLE_KEY | .env.local (server only) | Seed script, admin imports |
| NEXT_PUBLIC_SITE_URL | .env.local | Canonical URLs, sitemap, JSON-LD |
| RESEND_API_KEY | .env.local | Transactional emails |
| OWNER_EMAIL | .env.local | Inquiry notification recipient |
| GOOGLE_CLIENT_ID / SECRET | Supabase Auth | Google OAuth |
| APPLE_CLIENT_ID / SECRET | Supabase Auth | Apple OAuth |
| OPENAI_API_KEY (optional) | .env.local | Real AI meta generation |

## Acceptance Criteria Status

- PageSpeed >= 90 mobile: Next image optimization + font strategy configured. Verify on deploy.
- Filters < 1s on 10k listings: indexed columns (city, listing_type, price, bedrooms) + bounding-box query. Test with `npm run seed`.
- Map pins match coordinates: pins read listing `latitude/longitude` directly. Verify against sample CSV.
- Forms send email: inquiry route sends via Resend (graceful if key missing).

## Deployment

1. Push to GitHub: `git init && git add . && git commit -m "initial" && git remote add origin <url> && git push -u origin main`
2. Supabase: run `supabase/schema.sql` in the SQL editor (or `supabase db push`). Set Auth redirect URLs to your domain.
3. Vercel: import repo. Set framework Next.js, build `next build`, env vars from `.env.example`.
4. Seed data locally: `npm run seed` (needs local/remote Supabase creds in `.env.local`).
5. Verify: `npm run build` is green (confirmed in this repo). Smoke test /listings filter + map + inquiry email.

## Post-Launch Support

Two weeks of light bug-fixing on launch issues, tracked via the project repo issues.
