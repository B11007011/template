import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the Firebase auth token from cookies
  const authToken = request.cookies.get('firebase-auth-token')?.value;
  
  // Check if the path is a protected route
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/dashboard');
  
  // If it's a protected route and there's no auth token, redirect to login
  if (isProtectedRoute && !authToken) {
    // Get the requested URL to redirect back after login
    const requestedPage = request.nextUrl.pathname;
    const url = new URL('/account/login', request.url);
    
    // Add the redirect parameter
    url.searchParams.set('redirect', requestedPage);
    
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure the routes that this middleware should run on
export const config = {
  matcher: ['/dashboard/:path*'],
}; 