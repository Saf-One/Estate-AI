import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getListingById } from "@/lib/listings";

// NOTE: lightweight abuse protection. The insert is intentionally open to
// anonymous visitors (RLS permits anon insert), but a real deployment should
// add a per-IP rate limit here (e.g. Upstash Ratelimit / Vercel KV) to stop
// spam form submissions. This is left as a comment for now.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_URL = "https://api.resend.com/emails";

interface InquiryBody {
  listing_id?: string | null;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export async function POST(request: Request) {
  let body: InquiryBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = body.phone ? body.phone.trim() : null;
  const message = (body.message ?? "").trim();
  const listingId = body.listing_id ?? null;

  // Basic validation
  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "name, email and message are required" },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email is required" },
      { status: 400 },
    );
  }

  // Resolve the listing title only when a listing_id is provided.
  // Contact-form submissions omit listing_id and skip this lookup.
  let title: string | null = null;
  if (listingId) {
    const listing = await getListingById(listingId);
    title = listing?.title ?? null;
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("inquiries").insert({
    listing_id: listingId,
    name,
    email,
    phone,
    message,
    status: "new",
  });

  if (insertError) {
    console.error("inquiry insert error:", insertError.message);
    return NextResponse.json(
      { ok: false, error: "Could not save inquiry" },
      { status: 500 },
    );
  }

  // Emails are best-effort. If RESEND_API_KEY is missing we log and continue,
  // still returning success because the DB insert already succeeded.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      "[inquiries] RESEND_API_KEY not set; skipping confirmation emails.",
    );
  } else {
    const ownerEmail = process.env.OWNER_EMAIL ?? process.env.INQUIRY_TO_EMAIL;
    const fromEmail = process.env.INQUIRY_FROM_EMAIL ?? "listings@yourdomain.com";
    const subject = title ? `Thanks for your inquiry about ${title}` : "Thanks for contacting us";

    const prospectText = title
      ? `Hi ${name},\n\nThanks for your inquiry about "${title}". Our team will be in touch shortly.\n\nBest,\nThe EstateAI Team`
      : `Hi ${name},\n\nThanks for reaching out to us. Our team will be in touch shortly.\n\nBest,\nThe EstateAI Team`;

    const ownerSubject = title
      ? `New inquiry from ${name} (${email}) for ${title}`
      : `New inquiry from ${name} (${email})`;
    const ownerText = title
      ? `New inquiry from ${name} (${email}) for "${title}":\n\n${message}\n\nPhone: ${phone ?? "n/a"}`
      : `New inquiry from ${name} (${email}):\n\n${message}\n\nPhone: ${phone ?? "n/a"}`;

    await sendEmail(apiKey, {
      from: fromEmail,
      to: email,
      subject,
      text: prospectText,
    });
    if (ownerEmail) {
      await sendEmail(apiKey, {
        from: fromEmail,
        to: ownerEmail,
        subject: ownerSubject,
        text: ownerText,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

async function sendEmail(
  apiKey: string,
  payload: { from: string; to: string; subject: string; text: string },
) {
  try {
    await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Email failures must not break the inquiry flow.
    console.error("[inquiries] email send failed:", err);
  }
}
