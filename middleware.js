import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Protected routes
const protectedRoutes = [
  '/dashboard',
  '/customer-dashboard',
  '/provider-setup',
  '/customer-setup',
  '/booking'
];

// Auth-only routes (redirects to dashboard if authenticated)
const authRoutes = ['/login', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If accessing protected route without token
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If accessing auth routes with valid token
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    } catch (error) {
      // Token invalid, allow access to auth routes
    }
  }

  // Verify token for protected routes
  if (isProtectedRoute && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Add user info to headers (accessible in API routes)
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token invalid, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
