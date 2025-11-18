import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware to require either Authorization Bearer token or sb-access-token cookie
// for requests to /api/* endpoints. Endpoints still perform real token validation server-side.
export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Allow public API endpoints
  const publicApiPaths = ["/api/ai", "/api/health", "/api/public"];
  if (url.startsWith("/api/") && publicApiPaths.some((p) => url.startsWith(p))) return NextResponse.next();

  // Simple auth check for API and protected pages (/dashboard, /ai)
  const protectedPagePrefixes = ["/dashboard", "/ai"];

  const auth = req.headers.get("authorization");
  const cookieToken = req.cookies.get("sb-access-token");

  // If the request is for an API route (not public) and there's no token, return 401
  if (url.startsWith("/api/") && !publicApiPaths.some((p) => url.startsWith(p))) {
    if (!auth && !cookieToken) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    return NextResponse.next();
  }

  // If request is for a protected page and there's no token, redirect to login
  if (protectedPagePrefixes.some((p) => url === p || url.startsWith(p + "/"))) {
    if (!auth && !cookieToken) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard", "/dashboard/:path*", "/ai", "/ai/:path*"]
};
