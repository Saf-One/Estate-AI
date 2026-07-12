import type { ListingFilters, PropertyType, ListingType } from "@/lib/types";

const PROPERTY_TYPES: PropertyType[] = [
  "house",
  "apartment",
  "condo",
  "townhouse",
  "commercial",
  "land",
  "villa",
  "studio",
];
const LISTING_TYPES: ListingType[] = ["sale", "rent", "lease"];

function num(v: string | null | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Parse Next.js searchParams (Record<string, string | string[]>) into ListingFilters. */
export function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): ListingFilters {
  const get = (k: string): string | undefined => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const property_type = get("property_type")
    ?.split(",")
    .filter((t): t is PropertyType =>
      (PROPERTY_TYPES as string[]).includes(t),
    );

  const amenities = get("amenities")
    ?.split(",")
    .filter(Boolean);

  const boundsRaw = get("bounds");
  let bounds: ListingFilters["bounds"];
  if (boundsRaw) {
    const [n, s, e, w] = boundsRaw.split(",").map(Number);
    if ([n, s, e, w].every(Number.isFinite)) bounds = { n, s, e, w };
  }

  return {
    q: get("q") || undefined,
    listing_type: (get("listing_type") as ListingType) || undefined,
    property_type: property_type && property_type.length ? property_type : undefined,
    min_price: num(get("min_price")),
    max_price: num(get("max_price")),
    bedrooms_min: num(get("bedrooms_min")),
    bathrooms_min: num(get("bathrooms_min")),
    city: get("city") || undefined,
    amenities: amenities && amenities.length ? amenities : undefined,
    bounds,
    sort: (get("sort") as ListingFilters["sort"]) || "newest",
    page: num(get("page")) ?? 1,
  };
}

/** Serialize filters back to a query string for links. */
export function filtersToQuery(f: ListingFilters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.listing_type) p.set("listing_type", f.listing_type);
  if (f.property_type?.length) p.set("property_type", f.property_type.join(","));
  if (typeof f.min_price === "number") p.set("min_price", String(f.min_price));
  if (typeof f.max_price === "number") p.set("max_price", String(f.max_price));
  if (typeof f.bedrooms_min === "number")
    p.set("bedrooms_min", String(f.bedrooms_min));
  if (typeof f.bathrooms_min === "number")
    p.set("bathrooms_min", String(f.bathrooms_min));
  if (f.city) p.set("city", f.city);
  if (f.amenities?.length) p.set("amenities", f.amenities.join(","));
  if (f.bounds)
    p.set("bounds", [f.bounds.n, f.bounds.s, f.bounds.e, f.bounds.w].join(","));
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  return p.toString();
}
