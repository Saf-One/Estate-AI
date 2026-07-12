import Link from "next/link";
import { queryListings, queryListingPins } from "@/lib/listings";
import { parseFilters, filtersToQuery } from "@/lib/filters";
import ListingCard from "@/components/listing-card";
import FilterSidebar from "@/components/filter-sidebar";
import ListingsMap from "@/components/listings-map";
import SortSelect from "@/components/sort-select";

const PER_PAGE = 24;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [results, pins] = await Promise.all([
    queryListings({ ...filters, per_page: PER_PAGE }),
    queryListingPins(filters),
  ]);

  const { listings, total } = results;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = filters.page ?? 1;

  // Plain query string (no functions) passed to the client SortSelect.
  const baseQuery = filtersToQuery({ ...filters, page: 1 }).toString();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Property Listings</h1>
        <p className="text-sm text-slate-500">
          {total.toLocaleString()} properties found
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Filters */}
        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <FilterSidebar />
        </aside>

        {/* Results + Map */}
        <div className="space-y-6">
          {/* Map */}
          <div className="h-[360px] overflow-hidden rounded-xl border border-slate-200">
            <ListingsMap
              pins={pins as never}
              center={
                pins.length
                  ? [pins[0].latitude, pins[0].longitude]
                  : [39.5, -98.35]
              }
              zoom={pins.length > 1 ? 5 : 11}
            />
          </div>

          {/* Sort bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              {listings.length === 0
                ? "0"
                : `${(currentPage - 1) * PER_PAGE + 1}-${Math.min(
                    currentPage * PER_PAGE,
                    total,
                  )}`}{" "}
              of {total.toLocaleString()}
            </p>
            <SortSelect
              value={filters.sort ?? "newest"}
              baseQuery={baseQuery}
            />
          </div>

          {/* Grid */}
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map(l => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              No listings match your filters. Try widening your search.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  p =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1,
                )
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-slate-400">…</span>
                    )}
                    <Link
                      href={`/listings?${filtersToQuery({
                        ...filters,
                        page: p,
                      })}`}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        p === currentPage
                          ? "bg-brand text-white"
                          : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
