"use client";

import { useState } from "react";
import { Input, Textarea, Button } from "@/components/ui";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
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
          name,
          email,
          phone,
          message,
          listing_id: undefined,
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
          Message sent! We will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
    >
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
      <Textarea
        required
        placeholder="How can we help?"
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={5}
      />
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
