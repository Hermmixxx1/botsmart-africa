import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 
              process.env.COZE_SUPABASE_URL ||
              process.env.SUPABASE_URL;
  
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.SERVICE_ROLE_KEY;

  return { url, serviceKey };
}

// POST /api/admin/claim-admin - Claim admin access for logged-in user
export async function POST() {
  try {
    const { url, serviceKey } = getSupabaseCredentials();

    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Create client with service role key
    const supabase = createClient(url, serviceKey);

    // Get current user from the auth session cookie
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;

    // Check if already an admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingAdmin) {
      return NextResponse.json({ error: 'You are already an admin' }, { status: 400 });
    }

    // Check if admin_roles table exists and has the super_admin role
    const { data: roleData, error: roleError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', 'super_admin')
      .single();

    if (roleError || !roleData) {
      // If no roles exist, create the super_admin role first
      const { error: insertRoleError } = await supabase
        .from('admin_roles')
        .insert({
          name: 'super_admin',
          display_name: 'Super Administrator',
          description: 'Full access to all features',
          permissions: [
            'manage_settings', 'manage_admins', 'manage_roles', 'manage_pages',
            'manage_products', 'manage_orders', 'manage_sellers', 'view_analytics', 'manage_reviews'
          ],
          is_system: true,
        });

      if (insertRoleError) {
        console.error('Failed to create super_admin role:', insertRoleError);
        return NextResponse.json({ error: 'Failed to setup admin role. Please contact support.' }, { status: 500 });
      }

      // Get the newly created role
      const { data: newRole } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('name', 'super_admin')
        .single();

      if (!newRole) {
        return NextResponse.json({ error: 'Failed to create admin role' }, { status: 500 });
      }

      roleData.id = newRole.id;
    }

    // Create the admin user record
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role_id: roleData.id,
        is_active: true,
      });

    if (insertError) {
      console.error('Failed to create admin user:', insertError);
      return NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Welcome, ${user.email}! You are now a super admin.` 
    });

  } catch (error) {
    console.error('Claim admin error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
