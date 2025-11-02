import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Canonicalize to the origin defined by env, regardless of hosting provider.
// This keeps auth cookies and OAuth callback origins consistent on Vercel, Netlify, etc.
export default function proxy(request: NextRequest) {
  // Skip canonical redirects in development to avoid bouncing to production URLs
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const canonicalUrlStr =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL

  if (!canonicalUrlStr) {
    // No canonical origin configured; do nothing.
    return NextResponse.next()
  }

  let canonical: URL
  try {
    canonical = new URL(canonicalUrlStr)
  } catch {
    // Malformed env value; skip redirect rather than breaking requests.
    return NextResponse.next()
  }

  const reqHost = request.nextUrl.hostname
  const reqProto = request.nextUrl.protocol.replace(':', '')

  const targetHost = canonical.hostname
  const targetProto = canonical.protocol.replace(':', '')
  const targetPort = canonical.port // often empty for https

  const hostMismatch = reqHost !== targetHost
  const protoMismatch = reqProto !== targetProto

  if (hostMismatch || protoMismatch) {
    const url = new URL(request.url)
    url.protocol = canonical.protocol
    url.hostname = targetHost
    url.port = targetPort // '' keeps default port
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  // Match everything except static assets; include API so auth endpoints redirect too
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
