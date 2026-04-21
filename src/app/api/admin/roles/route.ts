import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';
import { requireSuperAdmin } from '@/lib/rbac';

// GET /api/admin/roles - Get all roles (super admin only)
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
      .from('admin_roles')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }

    return NextResponse.json({ roles: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch roles';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/roles - Create a new role (super admin only)
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
    const { name, display_name, description, permissions } = body;

    // Validate required fields
    if (!name || !display_name || !permissions) {
      return NextResponse.json(
        { error: 'Name, display name, and permissions are required' },
        { status: 400 }
      );
    }

    // Check if role name already exists
    const { data: existing } = await client
      .from('admin_roles')
      .select('name')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('admin_roles')
      .insert({
        name,
        display_name,
        description,
        permissions,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create role: ${error.message}`);
    }

    return NextResponse.json({ role: data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create role';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
