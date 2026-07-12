// Generates public/sample-listings.csv for the admin bulk-import template.
// Run: npx tsx scripts/generate-sample-csv.ts
import { writeFileSync, mkdirSync } from "node:fs";

const header = [
  "title",
  "listing_type",
  "property_type",
  "price",
  "currency",
  "city",
  "state",
  "address",
  "latitude",
  "longitude",
  "bedrooms",
  "bathrooms",
  "area_sqft",
  "status",
  "amenities",
  "image_urls",
];

const rows = [
  [
    "Modern 3BR House in Austin",
    "sale",
    "house",
    "525000",
    "USD",
    "Austin",
    "TX",
    "1200 Maple Ave",
    "30.2849",
    "-97.7341",
    "3",
    "2",
    "2100",
    "published",
    "Parking;Pool;Garden",
    "https://picsum.photos/seed/a1/800/600",
  ],
  [
    "Downtown Studio Apartment",
    "rent",
    "studio",
    "1800",
    "USD",
    "Seattle",
    "WA",
    "55 Pine Rd",
    "47.6101",
    "-122.3341",
    "1",
    "1",
    "600",
    "published",
    "Gym;Elevator;Pet Friendly",
    "https://picsum.photos/seed/a2/800/600",
  ],
  [
    "Commercial Office Space",
    "lease",
    "commercial",
    "9500",
    "USD",
    "Denver",
    "CO",
    "900 Cedar Ln",
    "39.7521",
    "-104.9911",
    "0",
    "2",
    "5400",
    "published",
    "Parking;Security;Heating",
    "https://picsum.photos/seed/a3/800/600",
  ],
];

mkdirSync("public", { recursive: true });
const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
writeFileSync("public/sample-listings.csv", csv);
console.log("Wrote public/sample-listings.csv");
