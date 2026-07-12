"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function UserRoleToggle({
  id,
  role,
}: {
  id: string;
  role: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(role);
  const [busy, setBusy] = useState(false);

  const next = current === "admin" ? "user" : "admin";

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      setCurrent(next);
      router.refresh();
    } catch {
      // keep current on failure
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" onClick={toggle} disabled={busy}>
      Make {next}
    </Button>
  );
}
