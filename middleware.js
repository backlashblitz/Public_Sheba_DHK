import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Check for supabase auth token in cookies
  const authCookie =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('supabase-auth-token') ||
    [...request.cookies.getAll()].find(c =>
      c.name.includes('auth-token') ||
      c.name.includes('sb-') && c.name.includes('-auth-token')
    )

  const isLoggedIn = !!authCookie

  // Public routes everyone can access
  const publicPaths = ['/login']
  const isPublicPath = publicPaths.includes(pathname)

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|api/).*)',
  ],
}