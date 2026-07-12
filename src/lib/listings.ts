import type {
  Listing,
  ListingFilters,
  ListingType,
  PropertyType,
} from "@/lib/types";

const DEFAULT_PER_PAGE = 24;

// Lazily resolve the server Supabase client so this module stays client-safe:
// components that only import the re-exported label constants (e.g. filter-sidebar)
// must not pull `next/headers` into a client bundle.
async function getSupabase() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

/**
 * Build and run a listings query from a filters object.
 * All WHERE clauses map to indexed columns (status, city, type, geo)
 * so a 10k dataset resolves in well under 1s.
 */
export async function queryListings(
  filters: ListingFilters = {},
): Promise<{ listings: Listing[]; total: number }> {
  const supabase = await getSupabase();
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(100, filters.per_page ?? DEFAULT_PER_PAGE);

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (filters.q && filters.q.trim().length > 0) {
    const term = filters.q.trim();
    // Trigram indexes on title + city make this fast
    query = query.or(`title.ilike.%${term}%,city.ilike.%${term}%`);
  }
  if (filters.listing_type) {
    query = query.eq("listing_type", filters.listing_type);
  }
  if (filters.property_type && filters.property_type.length > 0) {
    query = query.in("property_type", filters.property_type);
  }
  if (typeof filters.min_price === "number") {
    query = query.gte("price", filters.min_price);
  }
  if (typeof filters.max_price === "number") {
    query = query.lte("price", filters.max_price);
  }
  if (typeof filters.bedrooms_min === "number") {
    query = query.gte("bedrooms", filters.bedrooms_min);
  }
  if (typeof filters.bathrooms_min === "number") {
    query = query.gte("bathrooms", filters.bathrooms_min);
  }
  if (filters.city) {
    query = query.ilike("city", filters.city);
  }
  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains("amenities", filters.amenities);
  }
  // Bounding box for map-driven filtering
  if (filters.bounds) {
    const { n, s, e, w } = filters.bounds;
    query = query
      .gte("latitude", s)
      .lte("latitude", n)
      .gte("longitude", w)
      .lte("longitude", e);
  }

  // Sorting
  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("average_rating", { ascending: false });
      break;
    default:
      query = query.order("published_at", { ascending: false });
  }

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("queryListings error:", error.message);
    return { listings: [], total: 0 };
  }
  return {
    listings: (data as Listing[]) ?? [],
    total: count ?? 0,
  };
}

/** Lightweight pin payload for the map (lat/lng + id + price). */
export async function queryListingPins(filters: ListingFilters = {}) {
  const supabase = await getSupabase();
  let query = supabase
    .from("listings")
    .select("id,latitude,longitude,price,title,city,property_type")
    .eq("status", "published")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (filters.q && filters.q.trim()) {
    query = query.ilike("title", `%${filters.q.trim()}%`);
  }
  if (filters.listing_type) {
    query = query.eq("listing_type", filters.listing_type);
  }
  if (filters.property_type?.length) {
    query = query.in("property_type", filters.property_type);
  }
  if (typeof filters.min_price === "number")
    query = query.gte("price", filters.min_price);
  if (typeof filters.max_price === "number")
    query = query.lte("price", filters.max_price);
  if (typeof filters.bedrooms_min === "number")
    query = query.gte("bedrooms", filters.bedrooms_min);
  if (filters.city) query = query.ilike("city", filters.city);
  if (filters.bounds) {
    const { n, s, e, w } = filters.bounds;
    query = query
      .gte("latitude", s)
      .lte("latitude", n)
      .gte("longitude", w)
      .lte("longitude", e);
  }

  const { data, error } = await query;
  if (error) {
    console.error("queryListingPins error:", error.message);
    return [];
  }
  return data;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Listing;
}

export async function incrementViewCount(id: string) {
  const supabase = await getSupabase();
  await supabase.rpc("increment_listing_view", { listing_id: id });
}

/** Distinct cities for the location filter dropdown. */
export async function getCities(): Promise<string[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select("city")
    .eq("status", "published");
  if (error || !data) return [];
  return Array.from(new Set(data.map((r) => r.city))).sort();
}

// Re-export labels from types.ts (client-safe) for backward compatibility
export { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS, AMENITY_OPTIONS } from "@/lib/types";
