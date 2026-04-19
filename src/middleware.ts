import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const protectedPaths = ['/my', '/profile', '/user/']
const adminPaths = ['/admin']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/embed') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Refresh session for all routes
  const { supabaseResponse, user } = await updateSession(request)

  // Admin route protection
  if (adminPaths.some(p => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL('/en/login', request.url))
    }
    return supabaseResponse
  }

  // Apply i18n middleware
  const intlResponse = intlMiddleware(request)

  // Protected paths (after locale prefix)
  const pathWithoutLocale = pathname.replace(/^\/(en|fr|de|nl|pt|es)/, '')
  const isProtected = protectedPaths.some(p => pathWithoutLocale.startsWith(p))
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].some(p =>
    pathWithoutLocale.startsWith(p)
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/en/login', request.url))
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/en', request.url))
  }

  return intlResponse || supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|embed|.*\\..*).*)'],
}
