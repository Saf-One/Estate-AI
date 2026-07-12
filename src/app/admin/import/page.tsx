"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";

export default function AdminImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ imported: 0, errors: [data.error ?? "Import failed"] });
      } else {
        setResult({ imported: data.imported, errors: data.errors ?? [] });
        router.refresh();
      }
    } catch {
      setResult({ imported: 0, errors: ["Network error"] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Bulk Import</h1>

      <Card className="p-6">
        <p className="mb-4 text-sm text-slate-600">
          Upload a CSV with columns: title, listing_type, property_type, price,
          currency, city, state, address, latitude, longitude, bedrooms,
          bathrooms, area_sqft, status, amenities, image_urls. New rows are
          inserted with status defaulting to published when not set.
        </p>

        <a
          href="/sample-listings.csv"
          download
          className="mb-4 inline-block text-sm font-medium text-brand hover:underline"
        >
          Download sample CSV template
        </a>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20"
          />
          <Button type="submit" disabled={!file || submitting}>
            {submitting ? "Importing..." : "Import CSV"}
          </Button>
        </form>

        {result && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="font-semibold text-slate-900">
              Imported {result.imported} listing(s)
            </div>
            {result.errors.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-red-600">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
