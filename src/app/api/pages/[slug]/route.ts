import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// GET /api/pages/[slug] - Get a published page by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    const { slug } = await params;

    const { data, error } = await client
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
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
