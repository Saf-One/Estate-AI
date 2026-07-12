import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of the EstateAI property listings platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: placeholder</p>

      <section className="mt-8 space-y-3 text-slate-600">
        <h2 className="text-xl font-bold text-slate-900">Acceptance of terms</h2>
        <p>
          This is a placeholder terms of service. By using EstateAI you agree to
          use the platform lawfully and to provide accurate information when
          creating an account or submitting inquiries.
        </p>

        <h2 className="text-xl font-bold text-slate-900">Use of the platform</h2>
        <p>
          EstateAI provides listings for informational purposes. Listing details,
          pricing, and availability should always be confirmed directly with the
          listing agent or owner before making decisions.
        </p>

        <h2 className="text-xl font-bold text-slate-900">Accounts</h2>
        <p>
          You are responsible for keeping your account credentials secure. You
          agree not to misuse the platform or attempt to disrupt its operation.
        </p>

        <h2 className="text-xl font-bold text-slate-900">Contact</h2>
        <p>
          Questions about these terms can be sent through the contact page. A
          full version will replace this placeholder before launch.
        </p>
      </section>
    </div>
  );
}
