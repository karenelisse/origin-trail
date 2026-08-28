import { supabase } from "../config/supabase.js";

export async function getUserBySupabaseId(
  supabaseUserId: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("supabase_user_id", supabaseUserId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load user permissions: ${error.message}`,
    );
  }

  return data;
}