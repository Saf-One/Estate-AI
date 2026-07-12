import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import AgentForm, { type AgentFormValues } from "@/components/admin/agent-form";

export const dynamic = "force-dynamic";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .single();

  if (!agent) notFound();

  const initial: AgentFormValues = {
    id: agent.id,
    name: agent.name,
    agency: agent.agency ?? "",
    email: agent.email ?? "",
    phone: agent.phone ?? "",
    bio: agent.bio ?? "",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit Agent</h1>
      <Card className="p-6">
        <AgentForm initial={initial} />
      </Card>
    </div>
  );
}
