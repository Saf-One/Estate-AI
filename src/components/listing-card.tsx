import Link from "next/link";
import type { Listing } from "@/lib/types";
import { Badge, StarRating, formatPrice } from "@/components/ui";
import {
  LISTING_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/listings";

export default function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.image_urls?.[0];
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-48 w-full bg-slate-200">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={listing.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🏠
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="brand">{LISTING_TYPE_LABELS[listing.listing_type]}</Badge>
          <Badge tone="neutral">
            {PROPERTY_TYPE_LABELS[listing.property_type]}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-slate-900">
            {listing.title}
          </h3>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {listing.address}, {listing.city}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-brand">
            {formatPrice(listing.price, listing.currency, listing.price_period)}
          </span>
          {listing.average_rating > 0 && (
            <span className="flex items-center gap-1 text-sm">
              <StarRating value={listing.average_rating} size="sm" />
              <span className="text-slate-400">({listing.review_count})</span>
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-3 text-xs text-slate-500">
          <span>{listing.bedrooms} bd</span>
          <span>{listing.bathrooms} ba</span>
          <span>{listing.area_sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
}
