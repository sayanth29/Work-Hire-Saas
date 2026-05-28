import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    // 1. If user is admin: they should only be on /admin.
    // If they try to access seeker dashboard (/dashboard) or recruiter dashboard (/company/dashboard), redirect them to /admin.
    if (role === 'admin') {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/company/dashboard')) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    // 2. If user is recruiter: they should only be on /company/dashboard.
    // If they try to access seeker dashboard (/dashboard) or admin panel (/admin), redirect them to /company/dashboard.
    if (role === 'recruiter') {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/company/dashboard', req.url))
      }
    }

    // 3. If user is jobseeker: they should only be on /dashboard.
    // If they try to access recruiter dashboard (/company/dashboard) or admin panel (/admin), redirect them to /dashboard.
    if (role === 'jobseeker') {
      if (pathname.startsWith('/company/dashboard') || pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/company/dashboard/:path*',
    '/admin/:path*',
  ],
}