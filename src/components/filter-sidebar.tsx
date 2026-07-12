"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input, Select, Button } from "@/components/ui";
import {
  PROPERTY_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  AMENITY_OPTIONS,
} from "@/lib/types";
import type { PropertyType, ListingType } from "@/lib/types";

export default function FilterSidebar() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [listingType, setListingType] = useState(
    (params.get("listing_type") as ListingType) ?? "",
  );
  const [minPrice, setMinPrice] = useState(params.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") ?? "");
  const [bedrooms, setBedrooms] = useState(params.get("bedrooms_min") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [propertyTypes, setPropertyTypes] = useState<string[]>(
    params.get("property_type")?.split(",") ?? [],
  );
  const [amenities, setAmenities] = useState<string[]>(
    params.get("amenities")?.split(",") ?? [],
  );

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (listingType) p.set("listing_type", listingType);
    if (minPrice) p.set("min_price", minPrice);
    if (maxPrice) p.set("max_price", maxPrice);
    if (bedrooms) p.set("bedrooms_min", bedrooms);
    if (city) p.set("city", city);
    if (propertyTypes.length) p.set("property_type", propertyTypes.join(","));
    if (amenities.length) p.set("amenities", amenities.join(","));
    router.push(`/listings?${p.toString()}`);
  }

  function toggle(list: string[], set: (v: string[]) => void, v: string) {
    set(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  }

  function reset() {
    router.push("/listings");
  }

  return (
    <form
      onSubmit={apply}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5"
    >
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Keyword
        </label>
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Title or city"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Listing Type
        </label>
        <Select
          value={listingType}
          onChange={e => setListingType(e.target.value as ListingType)}
        >
          <option value="">Any</option>
          {(Object.keys(LISTING_TYPE_LABELS) as ListingType[]).map(t => (
            <option key={t} value={t}>
              {LISTING_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Min Price
          </label>
          <Input
            type="number"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Max Price
          </label>
          <Input
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Any"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Min Bedrooms
        </label>
        <Select value={bedrooms} onChange={e => setBedrooms(e.target.value)}>
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          City
        </label>
        <Input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="e.g. Austin"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Property Type
        </label>
        <div className="space-y-1.5">
          {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(t => (
            <label key={t} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={propertyTypes.includes(t)}
                onChange={() => toggle(propertyTypes, setPropertyTypes, t)}
                className="rounded border-slate-300 text-brand focus:ring-brand"
              />
              {PROPERTY_TYPE_LABELS[t]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Amenities
        </label>
        <div className="space-y-1.5">
          {AMENITY_OPTIONS.map(a => (
            <label key={a} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={amenities.includes(a)}
                onChange={() => toggle(amenities, setAmenities, a)}
                className="rounded border-slate-300 text-brand focus:ring-brand"
              />
              {a}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          Apply Filters
        </Button>
        <Button type="button" variant="secondary" onClick={reset}>
          Reset
        </Button>
      </div>

      <Link
        href="/listings"
        className="block text-center text-xs text-slate-400 hover:text-brand"
      >
        Clear map bounds
      </Link>
    </form>
  );
}
