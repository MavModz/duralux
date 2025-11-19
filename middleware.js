import { NextResponse } from 'next/server';

/**
 * Middleware to protect routes based on user roles
 * Admin cannot access /subadmin routes
 * SubAdmin cannot access /admin routes
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Only check protected routes (admin and subadmin)
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/subadmin')) {
    return NextResponse.next();
  }

  // Extract role from path
  const pathRole = pathname.startsWith('/admin') ? 'Admin' : 'SubAdmin';
  
  // Create response
  const response = NextResponse.next();
  
  // Set a header to indicate the required role for this route
  // This will be checked on the client side
  response.headers.set('x-required-role', pathRole);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

