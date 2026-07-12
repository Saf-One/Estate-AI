import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

// STUB: This route simulates AI meta-tag/summary generation.
// Wire to OpenAI / Anthropic later by replacing the mock logic below
// with a real LLM call using the listing fields as the prompt.

const TAG_POOL = [
  "real estate",
  "for sale",
  "for rent",
  "modern",
  "spacious",
  "city center",
  "family home",
  "investment",
  "luxury",
  "new listing",
];

function generateStub(listing: {
  property_type: string;
  city: string;
  listing_type: string;
}) {
  const summary = `Spacious ${listing.property_type} in ${listing.city}`;
  const base = [
    listing.listing_type === "rent" ? "for rent" : "for sale",
    listing.property_type,
    listing.city.toLowerCase(),
  ];
  const extra = TAG_POOL.filter(
    (t) => !base.includes(t) && t !== listing.property_type,
  ).slice(0, 3);
  const ai_tags = Array.from(new Set([...base, ...extra])).slice(0, 5);
  return { ai_summary: summary, ai_tags };
}

// POST /api/admin/ai -> generate meta tags + summary
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const supabase = await createClient();

  let targets;
  if (body.listing_id) {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("id", body.listing_id)
      .single();
    targets = data ? [data] : [];
  } else {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "draft");
    targets = data ?? [];
  }

  if (!targets || targets.length === 0) {
    return NextResponse.json({ error: "No matching listings" }, { status: 404 });
  }

  const updated = [];
  for (const listing of targets) {
    const { ai_summary, ai_tags } = generateStub(listing);
    const { error } = await supabase
      .from("listings")
      .update({ ai_summary, ai_tags })
      .eq("id", listing.id);
    if (!error) updated.push({ id: listing.id, ai_summary, ai_tags });
  }

  // Return the first result for the UI preview.
  return NextResponse.json(updated[0] ?? {});
}
