/**
 * Check Admin Status API
 * GET /api/auth/check-admin
 * 
 * Uses server-side session from cookies (via @supabase/ssr)
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper to get env vars
function getEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.COZE_SUPABASE_URL || 
         process.env.SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
             process.env.COZE_SUPABASE_ANON_KEY || 
             process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '',
  };
}

export async function GET() {
  try {
    const { url, anonKey, serviceKey } = getEnv();
    
    if (!url || !anonKey) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    // Get cookies from the request
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Create a temporary response for the server client
    // We need to use the server-side client with cookies
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    // Get user from session (this reads the browser's session cookie)
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Now check if user is admin using service role client
    // (bypasses RLS to check admin_users table)
    if (serviceKey) {
      const adminClient = createServerClient(url, serviceKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      });

      const { data: adminUser, error: dbError } = await adminClient
        .from('admin_users')
        .select('*, admin_roles(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (dbError || !adminUser) {
        return NextResponse.json({ 
          isAdmin: false, 
          error: 'Not an admin' 
        }, { status: 403 });
      }

      return NextResponse.json({
        isAdmin: true,
        user: {
          id: user.id,
          email: user.email,
        },
        role: adminUser.admin_roles?.name || 'admin',
        permissions: adminUser.admin_roles?.permissions || [],
      });
    }

    // Fallback: if no service key, just return authenticated
    return NextResponse.json({
      isAdmin: false,
      user: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}
