import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "EstateAI uses artificial intelligence to make property search faster and smarter. Learn how our platform helps buyers, renters, and agents find the right match.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">
        About EstateAI
      </h1>
      <p className="mt-4 text-slate-600">
        EstateAI is a property listings platform that uses artificial
        intelligence to help people find the right home or investment. We
        aggregate residential and commercial listings into one simple, searchable
        experience powered by smart filters and an interactive map.
      </p>

      <h2 className="mt-8 text-xl font-bold text-slate-900">
        How we use AI
      </h2>
      <p className="mt-2 text-slate-600">
        Our models summarize lengthy property descriptions, tag amenities and
        lifestyle features, and help rank listings that match what you are
        looking for. AI assists the search experience, but every listing is
        published by a verified agent or owner and the final decision is always
        yours.
      </p>

      <h2 className="mt-8 text-xl font-bold text-slate-900">Our mission</h2>
      <p className="mt-2 text-slate-600">
        We believe finding a property should be fast, transparent, and
        human-friendly. Whether you are buying, renting, or leasing, EstateAI is
        built to surface the options that matter to you and connect you directly
        with the people who can help.
      </p>

      <h2 className="mt-8 text-xl font-bold text-slate-900">Technology</h2>
      <p className="mt-2 text-slate-600">
        The platform is built on a modern web stack with server-rendered pages
        for speed and SEO, secure authentication, and a database designed to
        scale to tens of thousands of listings without slowing down.
      </p>
    </div>
  );
}
