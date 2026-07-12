import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import ListingForm from "@/components/admin/listing-form";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const supabase = await createClient();
  const { data: agents } = await supabase
    .from("agents")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New Listing</h1>
      <Card className="p-6">
        <ListingForm agents={agents ?? []} />
      </Card>
    </div>
  );
}
