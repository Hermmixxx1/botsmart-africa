import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';
import { requireAdmin, requireSuperAdmin, PERMISSIONS, hasPermission } from '@/lib/rbac';

// GET /api/admin/pages/[id] - Get a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    const { id } = await params;
    const auth = await requireAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.permissions, PERMISSIONS.PAGES_READ)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await client
      .from('pages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch page: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch page';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/pages/[id] - Update a page
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    const { id } = await params;
    const auth = await requireAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.permissions, PERMISSIONS.PAGES_WRITE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, content, meta_title, meta_description, is_published } = body;

    // If changing slug, check if new slug already exists
    if (slug) {
      const { data: existing } = await client
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: {
      title?: string;
      slug?: string;
      content?: string;
      meta_title?: string;
      meta_description?: string;
      is_published?: boolean;
      updated_by: string;
    } = {
      updated_by: auth.userId,
    };

    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (content) updateData.content = content;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (is_published !== undefined) updateData.is_published = is_published;

    const { data, error } = await client
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update page: ${error.message}`);
    }

    return NextResponse.json({ page: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update page';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/pages/[id] - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    const { id } = await params;
    const auth = await requireAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.permissions, PERMISSIONS.PAGES_DELETE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await client
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete page: ${error.message}`);
    }

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete page';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
