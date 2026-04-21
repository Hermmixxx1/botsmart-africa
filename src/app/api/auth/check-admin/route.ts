/**
 * Check Admin Status API
 * GET /api/auth/check-admin
 * 
 * Accepts JWT token from Authorization header
 */

import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

// Get admin client with optional JWT token
function getAdminClient(jwtToken?: string): SupabaseClient | null {
  const { url, serviceKey, anonKey } = getEnv();
  
  if (!url || !anonKey) {
    return null;
  }

  // Use service role key if available (for checking admin table)
  // Otherwise use anon key with JWT
  const key = serviceKey || anonKey;
  
  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // If we have a JWT, set it
  if (jwtToken) {
    // Set the session with the provided JWT
    client.auth.setSession({
      access_token: jwtToken,
      refresh_token: '',
    });
  }

  return client;
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
    const authHeader = request.headers.get('Authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');

    // Create client with JWT
    const supabase = getAdminClient(jwtToken || undefined);
    
    if (!supabase) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Failed to create client' 
      }, { status: 500 });
    }

    // Get user from the session/JWT
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Now check if user is admin
    // If we have service key, use it for admin table query
    // Otherwise, just return that user is authenticated (not admin)
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

    // No service key - just return authenticated (not admin)
    return NextResponse.json({
      isAdmin: false,
      user: {
        id: user.id,
        email: user.email,
      },
      message: 'Service key not configured for admin check',
    });

  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}
