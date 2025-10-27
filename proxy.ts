import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Force all preview deployment hostnames to the stable production alias
// so auth origin/cookies are consistent and providers' redirect URIs match.
export default function proxy(request: NextRequest) {
  const prodHost = 'expenses-tracker-pxpp.vercel.app'
  const hostname = request.nextUrl.hostname

  const isVercelPreview =
    hostname.endsWith('.vercel.app') && hostname !== prodHost

  if (isVercelPreview) {
    const url = new URL(request.url)
    url.hostname = prodHost
    url.port = '' // ensure default HTTPS port
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
