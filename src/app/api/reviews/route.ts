// ============================================================
// CONFIGURABLE VALUES - replace with your own
// ============================================================
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
  const rating = Number(body.rating);
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";

  if (!listing_id || typeof listing_id !== "string") {
    return NextResponse.json(
      { error: "listing_id is required" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "rating must be an integer from 1 to 5" },
      { status: 400 },
    );
  }
  if (comment.length === 0) {
    return NextResponse.json(
      { error: "comment is required" },
      { status: 400 },
    );
  }

  // Insert the review. The reviews table has no `title`/`status` columns in the
  // current schema, so the free-text review is stored in `body`.
  const { data: review, error: insertError } = await supabase
    .from("reviews")
    .insert({
      listing_id,
      user_id: user.id,
      rating,
      body: comment,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  // Recompute the listing's average_rating and review_count.
  const { data: stats } = await supabase
    .from("reviews")
    .select("rating")
    .eq("listing_id", listing_id);

  const count = stats?.length ?? 0;
  const avg =
    count > 0
      ? stats!.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
        count
      : 0;

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      average_rating: Math.round(avg * 100) / 100,
      review_count: count,
    })
    .eq("id", listing_id);

  if (updateError) {
    // The review was created; surface a soft warning but still return it.
    return NextResponse.json(
      { review, warning: updateError.message },
      { status: 201 },
    );
  }

  return NextResponse.json({ review }, { status: 201 });
}
