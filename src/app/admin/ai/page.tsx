"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge } from "@/components/ui";

export default function AdminAiPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    listing_id: string;
    ai_summary: string;
    ai_tags: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate(listingId?: string) {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">AI Tools</h1>

      <Card className="p-6">
        <p className="mb-4 text-sm text-slate-600">
          Generate AI meta tags and a summary for draft listings. Select a
          listing, or generate for all drafts at once.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => generate()} disabled={busy}>
            {busy ? "Generating..." : "Generate for all drafts"}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <Card className="p-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Listing {result.listing_id}
          </div>
          <p className="mb-3 text-sm text-slate-800">{result.ai_summary}</p>
          <div className="flex flex-wrap gap-2">
            {result.ai_tags.map((tag) => (
              <Badge key={tag} tone="brand">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
