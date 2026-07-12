import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { StarRating } from "@/components/ui";
import ReviewForm, { LoginToReview } from "@/components/review-form";

export interface ReviewWithAuthor {
  id: string;
  user_id: string;
  listing_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  author_name: string | null;
}

// Server component: fetches published reviews for a listing, joining the
// author's display name from profiles. Renders the list plus the review form
// (which handles the logged-in / logged-out states itself).
export default async function ReviewsList({
  listingId,
}: {
  listingId: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, listing_id, rating, title, body, created_at")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  const raw: any[] = data ?? [];

  // reviews.user_id references auth.users; profiles has no FK from reviews,
  // so resolve author names via a separate profiles lookup.
  let namesById: Record<string, string | null> = {};
  if (raw.length > 0) {
    const userIds = Array.from(new Set(raw.map((r) => r.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    namesById = Object.fromEntries(
      (profiles ?? []).map((p: any) => [p.id, p.full_name ?? null]),
    );
  }

  const reviews: ReviewWithAuthor[] = raw.map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    listing_id: r.listing_id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    created_at: r.created_at,
    author_name: namesById[r.user_id] ?? null,
  }));

  const user = await getCurrentUser();

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-base font-normal text-slate-400">
              ({reviews.length})
            </span>
          )}
        </h2>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          Could not load reviews right now.
        </p>
      )}

      {reviews.length === 0 && !error && (
        <p className="mt-3 text-sm text-slate-500">
          No reviews yet. Be the first to share your thoughts.
        </p>
      )}

      <ul className="mt-4 space-y-4">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                  {(review.author_name ?? "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {review.author_name ?? "Anonymous"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {review.created_at.slice(0, 10)}
                  </div>
                </div>
              </div>
              <StarRating value={review.rating} size="sm" />
            </div>
            {review.title && (
              <h3 className="mt-3 text-sm font-semibold text-slate-800">
                {review.title}
              </h3>
            )}
            {review.body && (
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                {review.body}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {user ? <ReviewForm listingId={listingId} /> : <LoginToReview />}
      </div>
    </section>
  );
}
