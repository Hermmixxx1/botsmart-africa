import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('category_id');
    const sellerId = searchParams.get('seller_id');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    let query = client
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        seller_profiles (
          id,
          seller_type,
          status,
          business_name
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Filter by category
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Filter by seller
    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }

    // Filter featured products
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Search products
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return NextResponse.json({ products: data, page, limit });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { name, slug, description, price, image_url } = body;
    if (!name || !slug || !description || !price || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get seller profile for the user
    const { data: sellerProfile, error: sellerError } = await client
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .maybeSingle();

    if (sellerError || !sellerProfile) {
      return NextResponse.json(
        { error: 'You must be an approved seller to create products' },
        { status: 403 }
      );
    }

    const { data, error } = await client
      .from('products')
      .insert({
        name,
        slug,
        description,
        price: parseFloat(price),
        compare_price: body.compare_price ? parseFloat(body.compare_price) : null,
        image_url,
        images: body.images || [],
        stock: body.stock || 0,
        category_id: body.category_id || null,
        seller_id: sellerProfile.id, // Associate product with seller
        is_active: body.is_active !== undefined ? body.is_active : true,
        is_featured: body.is_featured || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
