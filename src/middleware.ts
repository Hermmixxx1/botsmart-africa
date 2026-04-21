import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { applySecurityHeaders, rateLimit } from '@/lib/security';

// Rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
});

export async function middleware(request: NextRequest) {
  // Apply security headers to all responses
  const response = NextResponse.next();
  applySecurityHeaders(response);

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const isAllowed = await rateLimiter(request);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Get Supabase URL and Anon Key (support both prefixes)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                      process.env.COZE_SUPABASE_URL ||
                      process.env.SUPABASE_URL;
  
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          process.env.COZE_SUPABASE_ANON_KEY ||
                          process.env.SUPABASE_ANON_KEY;

  // Only protect routes if Supabase is configured
  if (supabaseUrl && supabaseAnonKey) {
    // Create server client using @supabase/ssr for proper cookie handling
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession();
    
    const isAuthenticated = session && !error;

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Protect seller routes (except register)
    if (request.nextUrl.pathname.startsWith('/seller') && request.nextUrl.pathname !== '/seller/register') {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
