import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';
import { requireSuperAdmin, PERMISSIONS } from '@/lib/rbac';

// GET /api/admin/admins - Get all admin users (super admin only)
export async function GET(request: NextRequest) {
  try {
    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    const auth = await requireSuperAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await client
      .from('admin_users')
      .select(`
        *,
        admin_roles (*),
        auth_user:auth.users!admin_users_user_id_fkey (
          email,
          raw_user_meta_data
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch admins: ${error.message}`);
    }

    return NextResponse.json({ admins: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch admins';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/admins - Create a new admin user (super admin only)
export async function POST(request: NextRequest) {
  try {
    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    const auth = await requireSuperAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role_id } = body;

    // Validate required fields
    if (!email || !role_id) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Check if role exists
    const { data: role, error: roleError } = await client
      .from('admin_roles')
      .select('*')
      .eq('id', role_id)
      .maybeSingle();

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Create auth user (using Supabase admin API would be better, but this is a simplified version)
    // In production, you should use the Supabase Management API or invite the user
    // For now, we'll assume the user already exists in auth.users
    const { data: existingUser } = await client.auth.admin.getUserById(email);

    // Check if user is already an admin
    const { data: existingAdmin } = await client
      .from('admin_users')
      .select('id')
      .eq('user_id', email)
      .maybeSingle();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      );
    }

    // For this implementation, we'll create a placeholder
    // In production, you'd properly create the auth user first
    const { data: newAdmin, error } = await client
      .from('admin_users')
      .insert({
        user_id: email, // In production, this should be the actual user UUID
        role_id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }

    return NextResponse.json({ admin: newAdmin }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create admin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
