// Seed script: generates sample listings for local/dev testing.
// Run with: npx tsx scripts/seed.ts   (or node after compile)
// Requires SUPABASE env vars (see .env.example). Pins are used for the
// map-accuracy acceptance test (coordinates stored == displayed).
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CITIES = [
  { city: "Austin", state: "TX", lat: 30.2672, lng: -97.7431 },
  { city: "Denver", state: "CO", lat: 39.7392, lng: -104.9903 },
  { city: "Seattle", state: "WA", lat: 47.6062, lng: -122.3321 },
  { city: "Miami", state: "FL", lat: 25.7617, lng: -80.1918 },
  { city: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298 },
  { city: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.074 },
  { city: "Atlanta", state: "GA", lat: 33.749, lng: -84.388 },
  { city: "Boston", state: "MA", lat: 42.3601, lng: -71.0589 },
];

const TYPES = ["sale", "rent", "lease"] as const;
const PROPS = [
  "house",
  "apartment",
  "condo",
  "townhouse",
  "commercial",
  "land",
  "villa",
  "studio",
] as const;
const STREETS = [
  "Maple Ave",
  "Oak St",
  "Pine Rd",
  "Cedar Ln",
  "Elm Blvd",
  "Birch Way",
  "Sunset Dr",
  "Lakeview Ct",
];

const AMENITY_POOL = [
  "Parking",
  "Pool",
  "Gym",
  "Pet Friendly",
  "Balcony",
  "Garden",
  "Fireplace",
  "Elevator",
  "Security",
  "Furnished",
  "Air Conditioning",
  "Heating",
];

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function jitter(base: number, spread: number): number {
  return base + (Math.random() - 0.5) * spread;
}
function round(n: number, d = 4): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

function makeListings(count: number) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const c = rand(CITIES);
    const prop = rand(PROPS);
    const type = rand(TYPES);
    const beds = 1 + Math.floor(Math.random() * 5);
    const price =
      type === "rent"
        ? 800 + Math.floor(Math.random() * 6000)
        : 150000 + Math.floor(Math.random() * 1850000);
    const amenities = AMENITY_POOL.filter(() => Math.random() > 0.6).slice(0, 6);

    out.push({
      title: `${beds}BR ${prop.charAt(0).toUpperCase() + prop.slice(1)} in ${c.city}`,
      slug: `seed-${i}-${Math.random().toString(36).slice(2, 7)}`,
      description: `A ${prop} located in ${c.city}, ${c.state}. Generated sample listing for testing.`,
      listing_type: type,
      property_type: prop,
      status: "published",
      price,
      currency: "USD",
      price_period: type === "sale" ? null : "month",
      bedrooms: beds,
      bathrooms: 1 + Math.floor(Math.random() * 3),
      area_sqft: 500 + Math.floor(Math.random() * 4000),
      address: `${100 + Math.floor(Math.random() * 9000)} ${rand(STREETS)}`,
      city: c.city,
      state: c.state,
      postal_code: String(10000 + Math.floor(Math.random() * 89999)),
      country: "US",
      latitude: round(jitter(c.lat, 0.18)),
      longitude: round(jitter(c.lng, 0.18)),
      amenities: amenities.length ? amenities : null,
      year_built: 1950 + Math.floor(Math.random() * 73),
      image_urls: [
        "https://picsum.photos/seed/" + i + "/800/600",
      ],
      views: Math.floor(Math.random() * 500),
      average_rating: 0,
      review_count: 0,
    });
  }
  return out;
}

async function run() {
  const COUNT = Number(process.env.SEED_COUNT ?? 10000);
  console.log(`Generating ${COUNT} listings...`);
  const batch = makeListings(COUNT);
  const { error } = await supabase.from("listings").insert(batch);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }
  console.log(`Seeded ${COUNT} listings successfully.`);
}

run();
