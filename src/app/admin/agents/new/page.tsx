import { Card } from "@/components/ui";
import AgentForm from "@/components/admin/agent-form";

export default function NewAgentPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New Agent</h1>
      <Card className="p-6">
        <AgentForm />
      </Card>
    </div>
  );
}
