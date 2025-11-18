import { createClient } from "@supabase/supabase-js";

// Read client-side Supabase envs. Do not embed keys in source.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Throw early in development so missing configuration is obvious.
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local or your deployment environment."
  );
}

export const supabase = createClient(url, anonKey);

export default supabase;
