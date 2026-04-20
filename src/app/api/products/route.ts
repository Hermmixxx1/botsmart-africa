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

    // Public API - exclude compare_price (markup) from response
    let query = client
      .from('products')
      .select('id, name, slug, description, price, image_url, stock, is_featured, category_id, seller_id, created_at, updated_at', { count: 'exact' })
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

    const { data, error, count } = await query;

    if (error) {
      // If relationship error, try simpler query
      if (error.message.includes('relationship') || error.message.includes('schema cache')) {
        const simpleQuery = client
          .from('products')
          .select('id, name, slug, description, price, image_url, stock, is_featured, category_id, seller_id, created_at, updated_at', { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (categoryId) simpleQuery.eq('category_id', categoryId);
        if (sellerId) simpleQuery.eq('seller_id', sellerId);
        if (featured === 'true') simpleQuery.eq('is_featured', true);
        if (search) simpleQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        simpleQuery.range(from, to);
        
        const { data: simpleData, error: simpleError, count: simpleCount } = await simpleQuery;
        
        if (simpleError) {
          throw new Error(`Failed to fetch products: ${simpleError.message}`);
        }
        
        return NextResponse.json({ products: simpleData, page, limit, total: simpleCount });
      }
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Try to get categories separately
    let categories: Record<string, any> = {};
    try {
      const { data: cats } = await client.from('categories').select('id, name, slug');
      if (cats) {
        cats.forEach((cat: any) => {
          categories[cat.id] = cat;
        });
      }
    } catch {
      // Categories not available
    }

    // Try to get sellers separately
    let sellers: Record<string, any> = {};
    try {
      const { data: sels } = await client.from('seller_profiles').select('id, seller_type, status, business_name');
      if (sels) {
        sels.forEach((sel: any) => {
          sellers[sel.id] = sel;
        });
      }
    } catch {
      // Sellers not available
    }

    // Attach related data to products
    const productsWithRelations = (data || []).map((product: any) => ({
      ...product,
      categories: categories[product.category_id] || null,
      seller_profiles: sellers[product.seller_id] || null,
    }));

    return NextResponse.json({ products: productsWithRelations, page, limit, total: count });
  } catch (error: any) {
    console.error('Products API error:', error);
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
