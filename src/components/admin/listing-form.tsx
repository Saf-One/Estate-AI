"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";

const LISTING_TYPES = ["sale", "rent", "lease"];
const PROPERTY_TYPES = [
  "house",
  "apartment",
  "condo",
  "townhouse",
  "commercial",
  "land",
  "villa",
  "studio",
];
const STATUSES = ["draft", "published", "archived"];
const CURRENCIES = ["USD", "EUR", "GBP", "AED", "CAD", "AUD"];
const PRICE_PERIODS = ["monthly", "yearly", ""];

export interface ListingFormValues {
  id?: string;
  title: string;
  description: string;
  listing_type: string;
  property_type: string;
  status: string;
  price: string;
  currency: string;
  price_period: string;
  bedrooms: string;
  bathrooms: string;
  area_sqft: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  year_built: string;
  amenities: string;
  image_urls: string;
  video_urls: string;
  floor_plan_urls: string;
  agent_id: string;
}

export const EMPTY_LISTING: ListingFormValues = {
  title: "",
  description: "",
  listing_type: "sale",
  property_type: "house",
  status: "draft",
  price: "",
  currency: "USD",
  price_period: "",
  bedrooms: "0",
  bathrooms: "0",
  area_sqft: "0",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
  latitude: "",
  longitude: "",
  year_built: "",
  amenities: "",
  image_urls: "",
  video_urls: "",
  floor_plan_urls: "",
  agent_id: "",
};

function toLines(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildPayload(v: ListingFormValues) {
  return {
    title: v.title,
    description: v.description || null,
    listing_type: v.listing_type,
    property_type: v.property_type,
    status: v.status,
    price: Number(v.price) || 0,
    currency: v.currency,
    price_period: v.price_period || null,
    bedrooms: Number(v.bedrooms) || 0,
    bathrooms: Number(v.bathrooms) || 0,
    area_sqft: Number(v.area_sqft) || 0,
    address: v.address,
    city: v.city,
    state: v.state || null,
    postal_code: v.postal_code || null,
    country: v.country || "US",
    latitude: v.latitude ? Number(v.latitude) : null,
    longitude: v.longitude ? Number(v.longitude) : null,
    year_built: v.year_built ? Number(v.year_built) : null,
    amenities: toLines(v.amenities),
    image_urls: toLines(v.image_urls),
    video_url: toLines(v.video_urls)[0] ?? null,
    floor_plan_urls: toLines(v.floor_plan_urls),
    agent_id: v.agent_id || null,
  };
}

export default function ListingForm({
  initial,
  agents,
}: {
  initial?: ListingFormValues;
  agents: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ListingFormValues>(
    initial ?? EMPTY_LISTING,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initial?.id);

  function update<K extends keyof ListingFormValues>(
    key: K,
    value: ListingFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = buildPayload(values);
      const res = isEdit
        ? await fetch(`/api/admin/listings/${initial!.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/listings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save listing");
      }
      router.push("/admin/listings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const field =
    "mb-4 [&>label]:mb-1 [&>label]:block [&>label]:text-sm [&>label]:font-medium [&>label]:text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className={field}>
        <label>Title</label>
        <Input
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>

      <div className={field}>
        <label>Description</label>
        <textarea
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          rows={4}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={field}>
          <label>Listing Type</label>
          <Select
            value={values.listing_type}
            onChange={(e) => update("listing_type", e.target.value)}
          >
            {LISTING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className={field}>
          <label>Property Type</label>
          <Select
            value={values.property_type}
            onChange={(e) => update("property_type", e.target.value)}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className={field}>
          <label>Status</label>
          <Select
            value={values.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUSES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className={field}>
          <label>Price</label>
          <Input
            type="number"
            step="0.01"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>Currency</label>
          <Select
            value={values.currency}
            onChange={(e) => update("currency", e.target.value)}
          >
            {CURRENCIES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className={field}>
          <label>Price Period</label>
          <Select
            value={values.price_period}
            onChange={(e) => update("price_period", e.target.value)}
          >
            {PRICE_PERIODS.map((t) => (
              <option key={t} value={t}>
                {t === "" ? "(none)" : t}
              </option>
            ))}
          </Select>
        </div>
        <div className={field}>
          <label>Agent</label>
          <Select
            value={values.agent_id}
            onChange={(e) => update("agent_id", e.target.value)}
          >
            <option value="">(none)</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className={field}>
          <label>Bedrooms</label>
          <Input
            type="number"
            value={values.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>Bathrooms</label>
          <Input
            type="number"
            step="0.5"
            value={values.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>Area (sqft)</label>
          <Input
            type="number"
            value={values.area_sqft}
            onChange={(e) => update("area_sqft", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>Year Built</label>
          <Input
            type="number"
            value={values.year_built}
            onChange={(e) => update("year_built", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={field}>
          <label>Address</label>
          <Input
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>City</label>
          <Input
            value={values.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>State</label>
          <Input
            value={values.state}
            onChange={(e) => update("state", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className={field}>
          <label>Postal Code</label>
          <Input
            value={values.postal_code}
            onChange={(e) => update("postal_code", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>Country</label>
          <Input
            value={values.country}
            onChange={(e) => update("country", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>Latitude</label>
          <Input
            type="number"
            step="any"
            value={values.latitude}
            onChange={(e) => update("latitude", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>Longitude</label>
          <Input
            type="number"
            step="any"
            value={values.longitude}
            onChange={(e) => update("longitude", e.target.value)}
          />
        </div>
      </div>

      <div className={field}>
        <label>Amenities (comma separated)</label>
        <Input
          value={values.amenities}
          onChange={(e) => update("amenities", e.target.value)}
          placeholder="Pool, Garage, Gym"
        />
      </div>

      <div className={field}>
        <label>Image URLs (comma or newline separated)</label>
        <textarea
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          rows={3}
          value={values.image_urls}
          onChange={(e) => update("image_urls", e.target.value)}
          placeholder="https://.../a.jpg, https://.../b.jpg"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={field}>
          <label>Video URLs (comma or newline separated)</label>
          <textarea
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            rows={3}
            value={values.video_urls}
            onChange={(e) => update("video_urls", e.target.value)}
            placeholder="https://.../tour.mp4"
          />
        </div>
        <div className={field}>
          <label>Floor Plan URLs (comma or newline separated)</label>
          <textarea
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            rows={3}
            value={values.floor_plan_urls}
            onChange={(e) => update("floor_plan_urls", e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Update Listing" : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
