import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Next.js 16 renamed middleware.ts -> proxy.ts (same request/response
 * lifecycle, now running on the Node.js runtime by default rather than
 * Edge). `auth` (from auth.ts) decodes the `authjs.session-token` /
 * `__Secure-authjs.session-token` cookie and exposes the result as
 * `req.auth` — no DB call needed since we're on the JWT session strategy.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isStudentRoute = pathname.startsWith("/student");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Not signed in at all -> bounce to /login, preserving the destination.
  if (!session?.user && (isStudentRoute || isDashboardRoute)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Signed in but wrong role for the area they're hitting.
  if (isStudentRoute && session?.user.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard/tickets", req.nextUrl.origin));
  }
  if (
    isDashboardRoute &&
    session?.user.role !== "STAFF" &&
    session?.user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/student/create-ticket", req.nextUrl.origin));
  }

  return NextResponse.next();
});

/**
 * Lightweight alternative if you only need "is there a session cookie at
 * all" without decoding it (e.g. for a fast pre-check before a heavier
 * gate elsewhere). Not used above, kept for reference:
 *
 *   const hasSessionCookie =
 *     req.cookies.has("authjs.session-token") ||
 *     req.cookies.has("__Secure-authjs.session-token");
 */

export const config = {
  matcher: ["/student/:path*", "/dashboard/:path*"],
};
