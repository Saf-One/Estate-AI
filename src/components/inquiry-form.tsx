"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";

export default function InquiryForm({
  listingId,
  listingTitle,
}: {
  listingId: string;
  listingTitle: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Hi, I am interested in "${listingTitle}". Please send me more details.`,
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          name,
          email,
          phone,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <div className="text-2xl">✅</div>
        <p className="mt-2 text-sm font-medium text-green-800">
          Inquiry sent! Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h3 className="text-lg font-bold text-slate-900">Contact Agent</h3>
      <Input
        required
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <Input
        required
        type="email"
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <Input
        placeholder="Phone (optional)"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <textarea
        required
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      {status === "error" && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send Inquiry"}
      </Button>
      <p className="text-xs text-slate-400">
        You and the agent both get an email confirmation.
      </p>
    </form>
  );
}
