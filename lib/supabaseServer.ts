import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read server-side envs. Prefer SUPABASE_URL for server; fall back to NEXT_PUBLIC_SUPABASE_URL if set.
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

function makeMissingClient(message: string): SupabaseClient {
  // Create a lightweight shim that throws helpful errors for common operations used by the app.
  const thrower = () => {
    throw new Error(message);
  };

  // Build a minimal object shaped like parts of Supabase client the server uses.
  // We cast to SupabaseClient to keep imports consistent; all methods will throw when invoked.
  const shim: any = {
    from: () => ({
      select: async () => { thrower(); },
      insert: async () => { thrower(); },
      update: async () => { thrower(); },
      delete: async () => { thrower(); },
    }),
    auth: {
      getUser: async () => { thrower(); },
      admin: {
        listUsers: async () => { thrower(); }
      }
    },
    // allow harmless access to RPC but throw on call
    rpc: async () => { thrower(); }
  };
  return shim as SupabaseClient;
}

let _supabaseAdmin: SupabaseClient;

if (!url || !serviceRole) {
  // Do not embed any secret values in source. If envs are missing, export a shim that throws
  // with a clear message so problems are visible at runtime rather than silently using a default key.
  const msg = `Supabase admin client not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.`;
  // Log once to help debugging in development
  // eslint-disable-next-line no-console
  console.warn("[supabaseServer] WARNING:", msg);
  _supabaseAdmin = makeMissingClient(msg);
} else {
  _supabaseAdmin = createClient(url, serviceRole, { auth: { persistSession: false } });
}

export const supabaseAdmin = _supabaseAdmin;
export default supabaseAdmin;
