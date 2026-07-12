import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Minimal CSV parser: supports quoted fields with commas and escaped quotes ("").
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // skip
    } else {
      field += char;
    }
  }
  // flush last field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map((h) => h.trim());
  return { headers, rows: rows.slice(1) };
}

function toArray(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function num(value: string, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const NUMERIC_FIELDS = new Set([
  "price",
  "latitude",
  "longitude",
  "bedrooms",
  "bathrooms",
  "area_sqft",
  "year_built",
]);

// POST /api/admin/import -> bulk CSV import of listings
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No CSV file provided" }, { status: 400 });
  }

  const text = await file.text();
  const { headers, rows } = parseCsv(text);
  if (headers.length === 0) {
    return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
  }

  const supabase = await createClient();
  const errors: string[] = [];
  const inserts: Record<string, unknown>[] = [];

  rows.forEach((cells, idx) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? "").trim();
    });
    if (!obj.title) {
      errors.push(`Row ${idx + 2}: missing title, skipped`);
      return;
    }
    const record: Record<string, unknown> = {
      title: obj.title,
      listing_type: obj.listing_type || "sale",
      property_type: obj.property_type || "house",
      price: num(obj.price),
      currency: obj.currency || "USD",
      price_period: obj.price_period ? obj.price_period : null,
      city: obj.city || "",
      state: obj.state || null,
      address: obj.address || "",
      latitude: obj.latitude ? num(obj.latitude) : null,
      longitude: obj.longitude ? num(obj.longitude) : null,
      bedrooms: num(obj.bedrooms),
      bathrooms: num(obj.bathrooms),
      area_sqft: num(obj.area_sqft),
      status: obj.status || "published",
      amenities: obj.amenities ? toArray(obj.amenities) : [],
      image_urls: obj.image_urls ? toArray(obj.image_urls) : [],
    };
    inserts.push(record);
  });

  let imported = 0;
  if (inserts.length > 0) {
    const { error } = await supabase.from("listings").insert(inserts);
    if (error) {
      return NextResponse.json(
        { error: error.message, imported: 0, errors },
        { status: 500 },
      );
    }
    imported = inserts.length;
  }

  return NextResponse.json({ imported, errors });
}
