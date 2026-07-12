// ============================================================
// CONFIGURABLE VALUES - replace with your own
// ============================================================
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("listing_id")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({
    listing_ids: (data ?? []).map((b: { listing_id: string }) => b.listing_id),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const listing_id = body.listing_id;
  if (!listing_id || typeof listing_id !== "string") {
    return NextResponse.json(
      { error: "listing_id is required" },
      { status: 400 },
    );
  }

  // Toggle: delete if it exists, otherwise insert.
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listing_id)
    .maybeSingle();

  if (existing) {
    const { error: delError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id);
    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 400 });
    }
    return NextResponse.json({ bookmarked: false });
  }

  const { error: insError } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, listing_id });
  if (insError) {
    return NextResponse.json({ error: insError.message }, { status: 400 });
  }
  return NextResponse.json({ bookmarked: true });
}
