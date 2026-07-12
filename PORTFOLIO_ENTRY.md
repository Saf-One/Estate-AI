# AI Real Estate Listings

A full property-listings platform: fast filtering, an interactive map, auth, reviews, and a full admin dashboard. Built for a freelance client.

## What Was Built

- Responsive public site with hero, featured listings, and listing detail pages
- Advanced search: keyword, price, beds/baths, property type, city, amenity filters
- Interactive Leaflet map with price pins that stay in sync with active filters
- Email/password auth plus Google and Apple OAuth via Supabase
- Reviews with star ratings and a DB trigger that keeps listing averages current
- Bookmark toggle and saved searches for signed-in users
- Inquiry forms that email both the prospect and the owner through Resend
- Admin dashboard: listing CRUD, agent management, user roles, analytics snapshot, CSV bulk import, AI meta-tag stub
- SEO layer: sitemap, robots, web manifest, per-page metadata, JSON-LD on listings

## Technical Approach

- Next.js 16 App Router with TypeScript and Tailwind v4
- Supabase for Postgres, auth, and row-level security
- Leaflet for the map, loaded client-side with no extra heavy deps
- Resend for transactional email with graceful fallback when the key is absent
- Filter queries mapped to indexed columns so 10k listings resolve in under a second
- Server components for data fetching, client components only where interactivity is needed

## Verification

- `npm run build` passes, all routes compile
- `tsc --noEmit` clean across the project
- Seed script generates 10k sample listings for filter and map acceptance tests
- Handover doc and deploy runbook included
