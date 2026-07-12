import Link from "next/link";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";

export default async function SiteHeader() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-[50] border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-brand">
            <span className="text-xl">🏠</span>
            <span className="text-lg">EstateAI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/listings" className="hover:text-brand">
              Browse
            </Link>
            <Link href="/listings?listing_type=sale" className="hover:text-brand">
              For Sale
            </Link>
            <Link href="/listings?listing_type=rent" className="hover:text-brand">
              For Rent
            </Link>
            {user && (
              <Link href="/saved" className="hover:text-brand">
                Saved
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {profile?.full_name?.split(" ")[0] ?? "Account"}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
