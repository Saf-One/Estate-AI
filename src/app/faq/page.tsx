import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about EstateAI: browsing listings, contacting agents, accounts, saved searches, and how our AI search works.",
};

const FAQS = [
  {
    q: "Do I need an account to browse listings?",
    a: "No. You can search, filter, and view every published listing without creating an account. Signing up is only needed to save searches, bookmark favorites, and leave reviews.",
  },
  {
    q: "How does the AI search work?",
    a: "Our models summarize property descriptions, tag amenities and lifestyle features, and help rank listings that match your filters. The AI assists discovery but every listing is published by a real agent or owner.",
  },
  {
    q: "Is it free to contact an agent?",
    a: "Yes. Submitting an inquiry from a listing or our contact page is free. Both you and the agent receive an email confirmation when you send a message.",
  },
  {
    q: "Can I save listings for later?",
    a: "Once you are signed in, you can bookmark any listing and build saved searches so you are notified when new properties match your criteria.",
  },
  {
    q: "Are the listings verified?",
    a: "Published listings are posted by verified agents or owners. Our system flags potential duplicate or inaccurate entries, but you should always confirm details directly with the listing contact.",
  },
  {
    q: "How do I list my own property?",
    a: "Property management and publishing is handled by our admin and agent tools. If you are an agent or owner interested in listing with us, use the contact page to reach the team.",
  },
  {
    q: "Is my data safe?",
    a: "We use secure authentication and only collect the information needed to connect you with listings. See our Privacy Policy for full details on what we store and why.",
  },
  {
    q: "Which areas do you cover?",
    a: "EstateAI is designed to scale across regions. Use the city and map filters to narrow results to the locations you care about most.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">
        Frequently Asked Questions
      </h1>
      <p className="mt-2 text-slate-600">
        Quick answers to the questions we hear most often.
      </p>

      <div className="mt-8 space-y-3">
        {FAQS.map(item => (
          <details
            key={item.q}
            className="group rounded-xl border border-slate-200 bg-white p-4"
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
              <span className="flex items-center justify-between">
                {item.q}
                <span className="ml-4 text-brand transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
