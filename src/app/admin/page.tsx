import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = await createClient();

  const [{ count: totalListings }, { count: published }, { count: drafts }, { count: inquiries }, { count: users }, { count: reviews }, citiesRes] =
    await Promise.all([
      supabase.from("listings").select("*", { count: "exact", head: true }),
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase.from("inquiries").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase
        .from("listings")
        .select("city")
        .neq("city", ""),
    ]);

  const byCity = new Map<string, number>();
  (citiesRes.data ?? []).forEach((row: { city: string }) => {
    byCity.set(row.city, (byCity.get(row.city) ?? 0) + 1);
  });
  const cityCounts = Array.from(byCity.entries()).sort((a, b) => b[1] - a[1]);

  return {
    totalListings: totalListings ?? 0,
    published: published ?? 0,
    drafts: drafts ?? 0,
    inquiries: inquiries ?? 0,
    users: users ?? 0,
    reviews: reviews ?? 0,
    cityCounts,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total Listings", value: stats.totalListings },
    { label: "Published", value: stats.published },
    { label: "Drafts", value: stats.drafts },
    { label: "Inquiries", value: stats.inquiries },
    { label: "Users", value: stats.users },
    { label: "Reviews", value: stats.reviews },
  ];

  const maxCity = stats.cityCounts.reduce((m, [, v]) => Math.max(m, v), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="text-2xl font-bold text-slate-900">{c.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              {c.label}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Listings per City
        </h2>
        {stats.cityCounts.length === 0 ? (
          <p className="text-sm text-slate-400">No listings yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.cityCounts.map(([city, count]) => (
              <div key={city} className="flex items-center gap-3">
                <div className="w-28 shrink-0 truncate text-sm text-slate-700">
                  {city}
                </div>
                <div className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${maxCity ? (count / maxCity) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-medium text-slate-700">
                  {count}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
