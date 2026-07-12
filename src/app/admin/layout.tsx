import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

const NAV = [
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin", label: "Analytics" },
  { href: "/admin/import", label: "Bulk Import" },
  { href: "/admin/ai", label: "AI Tools" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <aside className="w-full border-b border-slate-200 bg-white md:w-60 md:border-b-0 md:border-r">
        <div className="px-5 py-4">
          <Link href="/admin" className="text-lg font-bold text-brand">
            Admin
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
