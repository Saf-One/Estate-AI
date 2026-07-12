import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/admin/agents -> create (average_rating / review_count default to 0)
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .insert({
      name: body.name,
      agency: body.agency ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      bio: body.bio ?? null,
      average_rating: 0,
      review_count: 0,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
