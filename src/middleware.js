// Updated middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Skip NextAuth API routes and the sign-in page:
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth/signin")) {
    return NextResponse.next();
  }

  // Protect only certain routes; for instance, the root and first-level routes
  const isProtected = pathname === "/" || /^\/[^/]+\/?$/.test(pathname);

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    // You can set callbackUrl to the original pathname
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(.*)'], // adjust as needed
};
