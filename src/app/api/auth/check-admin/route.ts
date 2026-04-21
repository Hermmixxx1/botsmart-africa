/**
 * Check Admin Status API
 * GET /api/auth/check-admin
 * 
 * Receives JWT token from Authorization header
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: Request) {
  try {
    const { url, anonKey, serviceKey } = getEnv();
    
    if (!url || !anonKey) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    // Get JWT token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Create client with JWT token in global headers
    const supabase = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get user from the JWT
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Check if user is admin using service role client
    if (serviceKey) {
      const adminClient = createClient(url, serviceKey);
      
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
