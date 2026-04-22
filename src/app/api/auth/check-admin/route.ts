/**
 * Check Admin Status API
 * GET /api/auth/check-admin
 * 
 * Uses cookie-based session with direct token access
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
      console.error('Missing Supabase env vars');
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Create server client with cookies
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Check admin status using service role (bypasses RLS)
    if (serviceKey) {
      const adminClient = createServerClient(url, serviceKey, {
        cookies: {
          getAll() {
            return allCookies;
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
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
          error: 'Not an admin',
          userId: user.id
        }, { status: 403 });
      }

      return NextResponse.json({ 
        isAdmin: true, 
        userId: user.id,
        role: adminUser.admin_roles?.name || 'admin',
        email: user.email 
      });
    }

    // Fallback: try with anon key
    const { data: adminUser, error: dbError } = await supabase
      .from('admin_users')
      .select('*, admin_roles(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (dbError || !adminUser) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Not an admin',
        userId: user.id
      }, { status: 403 });
    }

    return NextResponse.json({ 
      isAdmin: true, 
      userId: user.id,
      role: adminUser.admin_roles?.name || 'admin',
      email: user.email 
    });

  } catch (error: any) {
    console.error('Check admin error:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: error.message || 'Server error' 
    }, { status: 500 });
  }
}
