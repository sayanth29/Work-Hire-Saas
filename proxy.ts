import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    if (role === 'admin') {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/company/dashboard')) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    if (role === 'recruiter') {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/company/dashboard', req.url))
      }
    }

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
  matcher: ['/dashboard/:path*', '/company/dashboard/:path*', '/admin/:path*'],
}
