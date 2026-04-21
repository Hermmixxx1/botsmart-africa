import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;

    // Public API - select only essential columns
    const { data, error } = await client
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        image_url,
        images,
        stock,
        is_featured,
        category_id,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: data });
  } catch (error: any) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;

    // Verify admin/seller access
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await client.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      compare_price,
      stock,
      image_url,
      images,
      category_id,
      is_active,
      is_featured,
    } = body;

    // Validate required fields
    if (!name || !price || stock === undefined) {
      return NextResponse.json(
        { error: 'Name, price, and stock are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await client
      .from('products')
      .update({
        name,
        slug,
        description,
        price,
        compare_price,
        stock,
        image_url,
        images,
        category_id,
        is_active,
        is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Product update error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: data });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}
