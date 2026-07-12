import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge, Card, StarRating } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const supabase = await createClient();
  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, agency, email, phone, average_rating, review_count")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
        <Link href="/admin/agents/new">
          <Button>New Agent</Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Agency</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(agents ?? []).map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {a.agency ?? <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {a.email ?? <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StarRating value={Number(a.average_rating)} size="sm" />
                      <span className="text-xs text-slate-500">
                        ({a.review_count})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/agents/${a.id}/edit`}
                      className="font-medium text-brand hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {(agents ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No agents found.
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
