// ============================================================
// CONFIGURABLE VALUES - replace with your own
// ============================================================
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { provider } = await request.json().catch(() => ({ provider: "google" }));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider === "apple" ? "apple" : "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ url: data.url });
}
