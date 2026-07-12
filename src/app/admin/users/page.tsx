import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import UserRoleToggle from "@/components/admin/user-role-toggle";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Users</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Toggle</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {u.full_name ?? <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {u.email ?? <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.role === "admin" ? "brand" : "neutral"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <UserRoleToggle id={u.id} role={u.role} />
                  </td>
                </tr>
              ))}
              {(users ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No users found.
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
