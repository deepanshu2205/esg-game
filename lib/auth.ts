import { supabaseAdmin } from "./supabaseServer";

export async function getUserFromRequest(req: Request) {
  // Prefer Authorization header, fallback to sb-access-token cookie
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let token: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    // try cookie header
    const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie") || "";
    const match = cookieHeader.split(";").map(s => s.trim()).find(s => s.startsWith("sb-access-token="));
    if (match) {
      token = match.split("=")[1] ?? null;
    }
  }

  if (!token) {
    throw new Error("no_token");
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token as string);
  if (error) throw error;

  // supabase admin may return { user } or the user object directly depending on client
  const user = (data as any)?.user ?? (data as any);
  if (!user) throw new Error("invalid_token");

  return { user, token };
}

export async function getOptionalUserFromRequest(req: Request) {
  try {
    return await getUserFromRequest(req);
  } catch (err) {
    return null;
  }
}
