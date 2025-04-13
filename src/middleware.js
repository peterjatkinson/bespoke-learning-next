import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Skip password gate page itself
  if (pathname === '/password-gate') {
    return NextResponse.next();
  }

  const cookie = request.cookies.get('access-token')?.value;

  const isProtected =
    pathname === '/' ||
    /^\/[^/]+\/?$/.test(pathname); // only root or one-level routes

  if (isProtected && cookie !== 'granted') {
    const url = request.nextUrl.clone();
    url.pathname = '/password-gate';
    url.searchParams.set('redirect', pathname); // ← add original path
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(.*)'],
};
