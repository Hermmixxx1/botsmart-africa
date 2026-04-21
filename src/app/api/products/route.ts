import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const client = getSupabase();
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('category_id');
    const sellerId = searchParams.get('seller_id');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Public API - select only essential columns
    let query = client
      .from('products')
      .select('id, name, slug, description, price, image_url, stock, is_featured, category_id, created_at, updated_at', { count: 'exact' })
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
      console.error('Products API error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get categories for products
    if (data && data.length > 0) {
      const categoryIds = [...new Set(data.map((p: any) => p.category_id).filter(Boolean))];
      
      if (categoryIds.length > 0) {
        const { data: categories } = await client
          .from('categories')
          .select('id, name, slug')
          .in('id', categoryIds);

        if (categories) {
          const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
          data.forEach((product: any) => {
            if (product.category_id) {
              product.categories = categoryMap.get(product.category_id) || null;
            }
          });
        }
      }
    }

    return NextResponse.json({
      products: data || [],
      page,
      limit,
      total: count || 0,
    });
  } catch (error: any) {
    console.error('Products API error:', error);
    // Return empty array instead of throwing to prevent page crashes
    return NextResponse.json({
      products: [],
      page: 1,
      limit: 12,
      total: 0,
    });
  }
}
