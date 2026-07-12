import Link from "next/link";
import { queryListings } from "@/lib/listings";
import ListingCard from "@/components/listing-card";
import { Button } from "@/components/ui";

export default async function HomePage() {
  const { listings } = await queryListings({
    sort: "newest",
    per_page: 6,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              AI-Powered Property Search
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Find your next property in seconds, not hours.
            </h1>
            <p className="mt-4 text-lg text-white/85">
              Advanced filters, an interactive map, and AI-assisted listings
              help you discover residential and commercial properties that fit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/listings"
                className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-brand hover:bg-white/90"
              >
                Browse Listings
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-white/40 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6">
          {[
            ["10k+", "Listings indexed"],
            ["< 1s", "Filter response"],
            ["Real-time", "Map pins"],
            ["AI", "Meta + dedup"],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-brand sm:text-3xl">{stat}</div>
              <div className="mt-1 text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Latest Listings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Fresh properties added to the marketplace.
            </p>
          </div>
          <Link
            href="/listings"
            className="hidden text-sm font-semibold text-brand hover:underline sm:block"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.length > 0 ? (
            listings.map((l) => <ListingCard key={l.id} listing={l} />)
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              No published listings yet. Run the seed script or add listings from the
              admin dashboard.
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Everything you need to buy, rent, or list
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["🔎", "Advanced Filters", "Filter by price, beds, type, and location with sub-second results."],
              ["🗺️", "Interactive Map", "See matching properties plotted live as you adjust filters."],
              ["⭐", "Reviews & Bookmarks", "Rate agents and listings, save favourites, store saved searches."],
              ["✉️", "Instant Inquiries", "Inquiry forms email you and the prospect automatically."],
              ["🤖", "AI Automations", "Auto image optimization, meta-tag generation, duplicate detection."],
              ["🔐", "Secure Admin", "Bulk-import listings, manage users, view analytics."],
            ].map(([icon, title, body]) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
