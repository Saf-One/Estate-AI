"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export default function ReviewForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating from 1 to 5.");
      return;
    }
    if (comment.trim().length === 0) {
      setError("Please write a short review.");
      return;
    }

    // Verify session client-side; the API route re-checks on the server.
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, rating, comment }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      setRating(0);
      setComment("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        Thanks! Your review was published.
        <button
          type="button"
          className="ml-2 font-semibold text-green-800 underline"
          onClick={() => setDone(false)}
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <h3 className="text-sm font-semibold text-slate-900">Write a review</h3>

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (hover || rating) >= star;
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              className="text-2xl leading-none transition-colors"
              style={{ color: active ? "#f59e0b" : "#cbd5e1" }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          );
        })}
        <span className="ml-2 text-sm text-slate-500">
          {rating > 0 ? `${rating} / 5` : "Select a rating"}
        </span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="Share details about your experience with this listing..."
        className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit review"}
        </Button>
      </div>
    </form>
  );
}

// Exported helper so a parent (e.g. ReviewsList) can render a login prompt.
export function LoginToReview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
      <Link href="/login" className="font-semibold text-brand hover:underline">
        Log in to review
      </Link>{" "}
      this listing.
    </div>
  );
}
