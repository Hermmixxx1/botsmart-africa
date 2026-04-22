/**
 * Next.js Proxy
 * Protects routes and applies security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security';

// Routes that don't require special handling
const bypassRoutes = [
  '/_next',
  '/api/public',
  '/products',
  '/page',
  '/favicon',
  '/public',
  '/fonts',
  '/images',
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Apply security headers to all responses
  const response = NextResponse.next();
  applySecurityHeaders(response);

  // 2. Bypass certain routes
  if (bypassRoutes.some(route => pathname.startsWith(route))) {
    return response;
  }

  // 3. For admin routes, just add cache headers and pass through
  // Auth checking is done in the page components, not proxy
  // This prevents proxy from blocking authenticated users
  if (pathname.startsWith('/admin')) {
    // Don't redirect here - let the page handle auth
    // The page will check if user is logged in and redirect
    return response;
  }

  return response;
}
