"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function BookmarkButton({
  listingId,
}: {
  listingId: string;
}) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Determine auth state and the current bookmark status on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      const res = await fetch("/api/bookmarks");
      if (!active) return;
      if (res.ok) {
        const payload = await res.json();
        const ids: string[] = payload.listing_ids ?? [];
        setBookmarked(ids.includes(listingId));
      }
    })();
    return () => {
      active = false;
    };
  }, [listingId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.ok) {
        const payload = await res.json();
        setBookmarked(Boolean(payload.bookmarked));
      }
    } finally {
      setLoading(false);
    }
  }

  // Not logged in: link to the login page.
  if (authed === false) {
    return (
      <Link
        href="/login"
        aria-label="Log in to bookmark"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition-colors hover:bg-slate-50"
      >
        ♡
      </Link>
    );
  }

  // Loading / unknown state: neutral placeholder.
  if (authed === null) {
    return (
      <span
        aria-hidden
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-300"
      >
        ♡
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors disabled:opacity-60 ${
        bookmarked
          ? "border-brand bg-brand/10 text-brand"
          : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {bookmarked ? "♥" : "♡"}
    </button>
  );
}
