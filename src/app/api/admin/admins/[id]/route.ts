import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';
import { requireSuperAdmin, PERMISSIONS } from '@/lib/rbac';

// GET /api/admin/admins/[id] - Get a specific admin user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    const { id } = await params;
    const auth = await requireSuperAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await client
      .from('admin_users')
      .select(`
        *,
        admin_roles (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch admin: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ admin: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch admin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/admins/[id] - Update an admin user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    const { id } = await params;
    const auth = await requireSuperAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent updating own role
    const { data: currentAdmin } = await client
      .from('admin_users')
      .select('user_id')
      .eq('id', id)
      .single();

    if (currentAdmin?.user_id === auth.userId) {
      return NextResponse.json(
        { error: 'Cannot update your own role' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role_id, is_active } = body;

    const updateData: {
      role_id?: string;
      is_active?: boolean;
    } = {};

    if (role_id) {
      // Check if role exists
      const { data: role } = await client
        .from('admin_roles')
        .select('id')
        .eq('id', role_id)
        .maybeSingle();

      if (!role) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      updateData.role_id = role_id;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const { data, error } = await client
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update admin: ${error.message}`);
    }

    return NextResponse.json({ admin: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update admin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/admins/[id] - Delete an admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    const { id } = await params;
    const auth = await requireSuperAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent deleting self
    const { data: currentAdmin } = await client
      .from('admin_users')
      .select('user_id')
      .eq('id', id)
      .single();

    if (currentAdmin?.user_id === auth.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const { error } = await client
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete admin: ${error.message}`);
    }

    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete admin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
