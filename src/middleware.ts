/**
 * Next.js Middleware
 * Protects routes and applies security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { applySecurityHeaders, rateLimit } from '@/lib/security';

// Rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
});

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth',
  '/products',
  '/contact-us',
  '/shipping-policy',
  '/return-policy',
  '/privacy-policy',
  '/terms-of-service',
  '/seller/register',
];

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  // Allow exact matches
  if (publicRoutes.includes(pathname)) return true;
  
  // Allow paths starting with these prefixes
  const publicPrefixes = [
    '/_next',
    '/api/public',
    '/products/',
    '/page/',
    '/favicon',
    '/public',
  ];
  
  return publicPrefixes.some(prefix => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Apply security headers to all responses
  const response = NextResponse.next();
  applySecurityHeaders(response);

  // 2. Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const isAllowed = await rateLimiter(request);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // 3. Skip auth checks for public routes
  if (isPublicRoute(pathname)) {
    return response;
  }

  // 4. For protected routes, check authentication
  if (!isSupabaseConfigured()) {
    // If Supabase not configured, allow through (dev mode)
    console.warn('Supabase not configured, skipping auth check');
    return response;
  }

  try {
    // Create server client with access to request cookies
    const supabase = createSupabaseServerClient({
      getAll() {
        return request.cookies.getAll();
      },
    });

    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Auth session error:', error.message);
    }

    const isAuthenticated = session && !error;

    // 5. Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Admin check happens in the page/layout, not here
      // This is intentional - allows us to show proper error pages
    }

    // 6. Protect seller routes (except register)
    if (pathname.startsWith('/seller') && pathname !== '/seller/register') {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // 7. Protect profile and orders
    if (pathname === '/profile' || pathname === '/wishlist') {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow request through but log it
    // This prevents the site from going down due to auth issues
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     * - Static pages we want to be publicly accessible
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
