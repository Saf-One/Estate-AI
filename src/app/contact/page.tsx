import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the EstateAI team for questions about listings, your account, or partnership opportunities.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Questions about a listing, your account, or how our AI search works?
        Send us a message and our team will respond as soon as possible.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_360px]">
        <ContactForm />

        <aside className="space-y-4 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Email</h2>
            <p className="mt-1">support@estateai.example</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Business hours</h2>
            <p className="mt-1">Monday to Friday, 9am to 6pm</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Office</h2>
            <p className="mt-1">123 Market Street, Suite 400, San Francisco, CA</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
