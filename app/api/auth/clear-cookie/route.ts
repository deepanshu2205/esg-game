import { NextResponse } from "next/server";

export async function POST() {
  // Clear cookie by setting expiration in the past
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  const cookie = `sb-access-token=; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=0`;
  const res = NextResponse.json({ success: true });
  res.headers.append("Set-Cookie", cookie);
  return res;
}
