/**
 * Check Admin Status API
 * GET /api/auth/check-admin
 * 
 * Uses cookies for session (Supabase SSR style)
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
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    const cookieStore = await cookies();

    // Create server client with cookies
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Not authenticated',
        debug: error?.message 
      }, { status: 401 });
    }

    // Check admin status using service role
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
          error: 'Not an admin',
          userId: user.id
        }, { status: 403 });
      }

      return NextResponse.json({
        isAdmin: true,
        user: { id: user.id, email: user.email },
        role: adminUser.admin_roles?.name || 'admin',
      });
    }

    // No service key - assume authenticated but not admin
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Service key not configured' 
    });

  } catch (error: any) {
    console.error('Check admin error:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: error.message || 'Server error' 
    }, { status: 500 });
  }
}
