import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accessToken = body?.access_token;
    if (!accessToken) return NextResponse.json({ error: "access_token required" }, { status: 400 });

    // Set HttpOnly cookie named `sb-access-token` for server-side requests
    // Make Secure conditional: only set Secure in production where HTTPS is available.
    const isProd = process.env.NODE_ENV === "production";
    const secureFlag = isProd ? "; Secure" : "";
    // Set cookie max-age to 7 days by default
    const maxAge = 60 * 60 * 24 * 7;
    const cookie = `sb-access-token=${accessToken}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${maxAge}`;

    const res = NextResponse.json({ success: true });
    res.headers.append("Set-Cookie", cookie);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
