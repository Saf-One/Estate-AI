import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge, Card } from "@/components/ui";
import { formatPrice } from "@/components/ui";

export const dynamic = "force-dynamic";

const LISTING_TYPES = ["sale", "rent", "lease"];
const PROPERTY_TYPES = [
  "house",
  "apartment",
  "condo",
  "townhouse",
  "commercial",
  "land",
  "villa",
  "studio",
];

export default async function AdminListingsPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, title, city, price, currency, price_period, status, view_count, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Listings</h1>
        <div className="flex gap-2">
          <Link href="/admin/import">
            <Button variant="secondary">Bulk Import</Button>
          </Link>
          <Link href="/admin/listings/new">
            <Button>New Listing</Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(listings ?? []).map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {l.title}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{l.city}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatPrice(l.price, l.currency, l.price_period)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        l.status === "published"
                          ? "green"
                          : l.status === "draft"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {l.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{l.view_count}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/listings/${l.id}/edit`}
                      className="font-medium text-brand hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {(listings ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No listings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Re-export for reuse in the form select lists.
export { LISTING_TYPES, PROPERTY_TYPES };
