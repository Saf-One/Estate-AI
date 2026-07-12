import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getListingById, incrementViewCount, queryListings } from "@/lib/listings";
import { Badge, StarRating, formatPrice } from "@/components/ui";
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/listings";
import InquiryForm from "@/components/inquiry-form";
import ReviewsList from "@/components/reviews-list";
import ListingJsonLd from "@/components/listing-jsonld";
import BookmarkButton from "@/components/bookmark-button";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) {
    return {
      title: "Listing not found",
      description: "This property listing could not be found.",
    };
  }
  const description =
    listing.ai_summary ??
    listing.description ??
    `View ${listing.title} in ${listing.city}.`;
  return {
    title: listing.title,
    description,
    openGraph: {
      title: listing.title,
      description,
      url: `${SITE_URL}/listings/${listing.id}`,
      type: "website",
      images: listing.image_urls?.length ? listing.image_urls : undefined,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing || listing.status !== "published") notFound();

  // Fire-and-forget view increment
  void incrementViewCount(id);

  // Related listings (same city, different id)
  const related = await queryListings({
    city: listing.city,
    per_page: 4,
  }).then(r => r.listings.filter(l => l.id !== listing.id).slice(0, 3));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description ?? listing.title,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/listings/${listing.id}`,
    image: listing.image_urls ?? [],
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      ...(listing.price_period
        ? { leaseLength: listing.price_period }
        : {}),
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressRegion: listing.state ?? "",
      postalCode: listing.postal_code ?? "",
      addressCountry: listing.country,
    },
    geo: listing.latitude
      ? {
          "@type": "GeoCoordinates",
          latitude: listing.latitude,
          longitude: listing.longitude,
        }
      : undefined,
    numberOfRooms: listing.bedrooms,
    numberOfBathroomsTotal: listing.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.area_sqft,
      unitCode: "SQF",
    },
    ...(listing.average_rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: listing.average_rating,
            reviewCount: listing.review_count,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ListingJsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/listings" className="hover:text-brand">
          Listings
        </Link>{" "}
        / <span className="text-slate-700">{listing.city}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main */}
        <div>
          {/* Gallery */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {listing.image_urls?.length ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {listing.image_urls.slice(0, 5).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${listing.title} image ${i + 1}`}
                    className={`w-full object-cover ${
                      i === 0 ? "h-80 sm:col-span-2" : "h-48"
                    }`}
                    loading="lazy"
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center text-6xl">
                🏠
              </div>
            )}
          </div>

          {/* Title + actions */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex gap-2">
                <Badge tone="brand">
                  {LISTING_TYPE_LABELS[listing.listing_type]}
                </Badge>
                <Badge tone="neutral">
                  {PROPERTY_TYPE_LABELS[listing.property_type]}
                </Badge>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {listing.title}
              </h1>
              <p className="mt-1 text-slate-500">
                {listing.address}, {listing.city}
                {listing.state ? `, ${listing.state}` : ""}
              </p>
              {listing.average_rating > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating value={listing.average_rating} />
                  <span className="text-sm text-slate-500">
                    ({listing.review_count} reviews)
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-brand">
                {formatPrice(
                  listing.price,
                  listing.currency,
                  listing.price_period,
                )}
              </div>
              <div className="mt-3">
                <BookmarkButton listingId={listing.id} />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
            {[
              ["Bedrooms", listing.bedrooms],
              ["Bathrooms", listing.bathrooms],
              ["Area", `${listing.area_sqft.toLocaleString()} sqft`],
              ["Year Built", listing.year_built ?? "N/A"],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  {label}
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-slate-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">
              {listing.description ?? "No description provided."}
            </p>
            {listing.ai_summary && (
              <div className="mt-4 rounded-lg bg-brand/5 p-4 text-sm text-slate-600">
                <span className="font-semibold text-brand">AI Summary: </span>
                {listing.ai_summary}
              </div>
            )}
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-slate-900">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.amenities.map(a => (
                  <Badge key={a} tone="neutral">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Floor plans */}
          {listing.floor_plan_urls?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-slate-900">Floor Plans</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {listing.floor_plan_urls.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Floor plan ${i + 1}`}
                    className="w-full rounded-lg border border-slate-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8">
            <ReviewsList listingId={listing.id} />
          </div>
        </div>

        {/* Sidebar: inquiry + agent */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <InquiryForm listingId={listing.id} listingTitle={listing.title} />
          {listing.agent_id && (
            <AgentCard agentId={listing.agent_id} />
          )}
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">
            More in {listing.city}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map(l => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm hover:shadow-md"
              >
                <div className="font-semibold text-slate-900">{l.title}</div>
                <div className="mt-1 text-brand">
                  {formatPrice(l.price, l.currency, l.price_period)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

async function AgentCard({ agentId }: { agentId: string }) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .single();
  if (!data) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700">Listed by</h3>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-xl">
          👤
        </div>
        <div>
          <div className="font-semibold text-slate-900">{data.name}</div>
          {data.agency && (
            <div className="text-xs text-slate-500">{data.agency}</div>
          )}
        </div>
      </div>
      {data.average_rating > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <StarRating value={data.average_rating} size="sm" />
          <span className="text-xs text-slate-500">
            ({data.review_count})
          </span>
        </div>
      )}
    </div>
  );
}
