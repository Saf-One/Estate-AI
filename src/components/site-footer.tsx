import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-brand">
            <span className="text-xl">🏠</span>
            <span>EstateAI</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Smart property search powered by AI. Find residential and commercial
            listings with advanced filters and an interactive map.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/listings" className="hover:text-brand">All Listings</Link></li>
            <li><Link href="/listings?listing_type=sale" className="hover:text-brand">For Sale</Link></li>
            <li><Link href="/listings?listing_type=rent" className="hover:text-brand">For Rent</Link></li>
            <li><Link href="/listings?property_type=commercial" className="hover:text-brand">Commercial</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/login" className="hover:text-brand">Log in</Link></li>
            <li><Link href="/signup" className="hover:text-brand">Sign up</Link></li>
            <li><Link href="/saved" className="hover:text-brand">Saved & Bookmarks</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/about" className="hover:text-brand">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-brand">FAQ</Link></li>
            <li><Link href="/privacy" className="hover:text-brand">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} EstateAI. All rights reserved.
      </div>
    </footer>
  );
}
