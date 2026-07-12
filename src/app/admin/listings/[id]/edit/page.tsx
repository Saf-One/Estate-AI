import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import ListingForm, {
  type ListingFormValues,
} from "@/components/admin/listing-form";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: listing }, { data: agents }] = await Promise.all([
    supabase.from("listings").select("*").eq("id", id).single(),
    supabase.from("agents").select("id, name").order("name", { ascending: true }),
  ]);

  if (!listing) notFound();

  const initial: ListingFormValues = {
    id: listing.id,
    title: listing.title,
    description: listing.description ?? "",
    listing_type: listing.listing_type,
    property_type: listing.property_type,
    status: listing.status,
    price: String(listing.price),
    currency: listing.currency,
    price_period: listing.price_period ?? "",
    bedrooms: String(listing.bedrooms),
    bathrooms: String(listing.bathrooms),
    area_sqft: String(listing.area_sqft),
    address: listing.address,
    city: listing.city,
    state: listing.state ?? "",
    postal_code: listing.postal_code ?? "",
    country: listing.country,
    latitude: listing.latitude != null ? String(listing.latitude) : "",
    longitude: listing.longitude != null ? String(listing.longitude) : "",
    year_built: listing.year_built != null ? String(listing.year_built) : "",
    amenities: (listing.amenities ?? []).join(", "),
    image_urls: (listing.image_urls ?? []).join("\n"),
    video_urls: listing.video_url ? listing.video_url : "",
    floor_plan_urls: (listing.floor_plan_urls ?? []).join("\n"),
    agent_id: listing.agent_id ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit Listing</h1>
      <Card className="p-6">
        <ListingForm initial={initial} agents={agents ?? []} />
      </Card>
    </div>
  );
}
