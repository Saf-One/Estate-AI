"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export interface AgentFormValues {
  id?: string;
  name: string;
  agency: string;
  email: string;
  phone: string;
  bio: string;
}

export const EMPTY_AGENT: AgentFormValues = {
  name: "",
  agency: "",
  email: "",
  phone: "",
  bio: "",
};

export default function AgentForm({
  initial,
}: {
  initial?: AgentFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<AgentFormValues>(
    initial ?? EMPTY_AGENT,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initial?.id);

  function update<K extends keyof AgentFormValues>(
    key: K,
    value: AgentFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: values.name,
        agency: values.agency || null,
        email: values.email || null,
        phone: values.phone || null,
        bio: values.bio || null,
      };
      const res = isEdit
        ? await fetch(`/api/admin/agents/${initial!.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/agents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save agent");
      }
      router.push("/admin/agents");
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
        <label>Name</label>
        <Input
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={field}>
          <label>Agency</label>
          <Input
            value={values.agency}
            onChange={(e) => update("agency", e.target.value)}
          />
        </div>
        <div className={field}>
          <label>Email</label>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      <div className={field}>
        <label>Phone</label>
        <Input
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>

      <div className={field}>
        <label>Bio</label>
        <textarea
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          rows={4}
          value={values.bio}
          onChange={(e) => update("bio", e.target.value)}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Update Agent" : "Create Agent"}
        </Button>
      </div>
    </form>
  );
}
