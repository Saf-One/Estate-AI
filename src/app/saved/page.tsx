import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import ListingCard from "@/components/listing-card";
import type { Listing } from "@/lib/types";

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Saved searches
  const { data: savedSearches } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Bookmarked listings
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("listing_id")
    .eq("user_id", user.id);

  let savedListings: Listing[] = [];
  const ids = (bookmarks ?? []).map((b: { listing_id: string }) => b.listing_id);
  if (ids.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("*")
      .in("id", ids)
      .eq("status", "published");
    savedListings = (listings as Listing[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Saved</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your saved searches and bookmarked listings.
      </p>

      {/* Saved searches */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Saved searches</h2>
        {savedSearches && savedSearches.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {savedSearches.map((s: any) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">
                    {s.name}
                  </div>
                  <div className="truncate text-sm text-slate-500">
                    {summarizeFilters(s.filters)}
                  </div>
                </div>
                <Link
                  href={`/listings?${filtersToQuery(s.filters)}`}
                  className="shrink-0 rounded-lg bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand/20"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No saved searches yet. Use the filters on the{" "}
            <Link href="/listings" className="text-brand hover:underline">
              listings page
            </Link>{" "}
            to save one.
          </p>
        )}
      </section>

      {/* Bookmarked listings */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Bookmarked listings
        </h2>
        {savedListings.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No bookmarks yet. Tap the heart on any listing to save it here.
          </p>
        )}
      </section>
    </div>
  );
}

function summarizeFilters(filters: Record<string, unknown> | null): string {
  if (!filters) return "All listings";
  const parts: string[] = [];
  if (filters.listing_type) parts.push(String(filters.listing_type));
  if (Array.isArray(filters.property_type))
    parts.push((filters.property_type as string[]).join(", "));
  if (typeof filters.city === "string") parts.push(filters.city);
  if (typeof filters.min_price === "number")
    parts.push(`from $${filters.min_price.toLocaleString()}`);
  if (typeof filters.max_price === "number")
    parts.push(`up to $${filters.max_price.toLocaleString()}`);
  if (typeof filters.bedrooms_min === "number")
    parts.push(`${filters.bedrooms_min}+ bd`);
  return parts.length > 0 ? parts.join(" · ") : "All listings";
}

function filtersToQuery(filters: Record<string, unknown> | null): string {
  const p = new URLSearchParams();
  if (!filters) return "";
  if (typeof filters.q === "string") p.set("q", filters.q);
  if (typeof filters.listing_type === "string")
    p.set("listing_type", filters.listing_type);
  if (Array.isArray(filters.property_type))
    p.set("property_type", (filters.property_type as string[]).join(","));
  if (typeof filters.min_price === "number")
    p.set("min_price", String(filters.min_price));
  if (typeof filters.max_price === "number")
    p.set("max_price", String(filters.max_price));
  if (typeof filters.bedrooms_min === "number")
    p.set("bedrooms_min", String(filters.bedrooms_min));
  if (typeof filters.bathrooms_min === "number")
    p.set("bathrooms_min", String(filters.bathrooms_min));
  if (typeof filters.city === "string") p.set("city", filters.city);
  if (Array.isArray(filters.amenities))
    p.set("amenities", (filters.amenities as string[]).join(","));
  if (typeof filters.sort === "string") p.set("sort", filters.sort);
  return p.toString();
}
