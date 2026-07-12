import { createClient } from "@/lib/supabase/server";

/**
 * Get the current logged-in user (server-side).
 * Returns null when not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

export async function isAdmin() {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
