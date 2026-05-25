import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Grab the token from cookies (best practice for Next.js)
  const token = request.cookies.get('devpulse_session')?.value
  const { pathname } = request.nextUrl

  // 2. Define your routing rules
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isProtectedPage = pathname.startsWith('/issues/new') || pathname.endsWith('/edit')

  // 3. Redirect rules
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/issues', request.url))
  }

  return NextResponse.next()
}

// Only run middleware on these specific routes
export const config = {
  matcher: ['/issues/:path*', '/login', '/signup'],
}