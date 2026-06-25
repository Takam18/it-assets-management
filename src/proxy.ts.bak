import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/']
const publicRoutes = ['/login']
const adminRoutes = ['/admin/users']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith('/assets') || path.startsWith('/employees') || path.startsWith('/departments') || path.startsWith('/locations') || path.startsWith('/vendors') || path.startsWith('/categories') || path.startsWith('/assignments') || path.startsWith('/maintenance') || path.startsWith('/brands')
  const isPublicRoute = publicRoutes.includes(path)
  const isAdminRoute = path.startsWith('/admin')

  // Decrypt the session from the cookie
  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  // Redirect to /change-password if the user's password has expired
  if (session?.userId && session?.passwordExpired && path !== '/change-password' && !path.startsWith('/logout')) {
    return NextResponse.redirect(new URL('/change-password', req.nextUrl))
  }

  // Redirect to /login if the user is not authenticated
  if ((isProtectedRoute || isAdminRoute || path === '/change-password') && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Redirect to / if the user is not an ADMIN trying to access /admin
  if (isAdminRoute && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  // Redirect to / if the user is authenticated and tries to access /login
  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith('/')
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
