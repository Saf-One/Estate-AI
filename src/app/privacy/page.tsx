import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EstateAI collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: placeholder</p>

      <section className="mt-8 space-y-3 text-slate-600">
        <h2 className="text-xl font-bold text-slate-900">Overview</h2>
        <p>
          This is a placeholder privacy policy. EstateAI collects only the
          information needed to provide our service, including account details,
          saved searches, and inquiry form submissions you choose to send.
        </p>

        <h2 className="text-xl font-bold text-slate-900">Information we collect</h2>
        <p>
          We collect information you provide directly, such as your name, email,
          and messages sent through inquiry forms, plus usage data that helps us
          improve search results.
        </p>

        <h2 className="text-xl font-bold text-slate-900">How we use it</h2>
        <p>
          Your information is used to connect you with listings and agents,
          remember your saved searches, and operate the platform securely. We do
          not sell your personal data.
        </p>

        <h2 className="text-xl font-bold text-slate-900">Contact</h2>
        <p>
          For privacy questions, reach us through the contact page. A full
          version of this policy will replace this placeholder before launch.
        </p>
      </section>
    </div>
  );
}
