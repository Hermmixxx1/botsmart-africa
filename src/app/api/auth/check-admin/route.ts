/**
 * Check Admin Status API
 * GET /api/auth/check-admin
 * 
 * Returns admin status for the current authenticated user
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const adminClient = getSupabaseAdminClient();
    
    if (!adminClient) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    // Get user from session (uses cookies)
    const { data: { user }, error } = await adminClient.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Check if user is in admin_users table
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

  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}
