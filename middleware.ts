// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("auth_token"); // We set this cookie in the Login page earlier

  // 1. If user is NOT logged in and tries to visit Dashboard -> Kick to Login
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If user IS logged in and tries to visit Login -> Kick to Dashboard
  if (session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configuration: Only run this check on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};