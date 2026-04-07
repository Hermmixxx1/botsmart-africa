import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, requireSuperAdmin, PERMISSIONS, hasPermission } from '@/lib/rbac';

// GET /api/admin/pages - Get all pages (admin only)
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const auth = await requireAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to read pages
    if (!hasPermission(auth.permissions, PERMISSIONS.PAGES_READ)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    let query = client.from('pages').select('*').order('created_at', { ascending: false });

    if (published === 'true') {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch pages: ${error.message}`);
    }

    return NextResponse.json({ pages: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pages';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/pages - Create a new page (admin only)
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const auth = await requireAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to write pages
    if (!hasPermission(auth.permissions, PERMISSIONS.PAGES_WRITE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, content, meta_title, meta_description, is_published } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existing } = await client
      .from('pages')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('pages')
      .insert({
        title,
        slug,
        content,
        meta_title,
        meta_description,
        is_published: is_published || false,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create page: ${error.message}`);
    }

    return NextResponse.json({ page: data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create page';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
