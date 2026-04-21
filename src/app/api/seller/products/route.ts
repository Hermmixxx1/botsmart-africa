import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// GET /api/seller/products - Get seller's products
export async function GET(request: NextRequest) {
  try {
    const client = getSupabase();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get seller profile
    const { data: sellerProfile, error: sellerError } = await client
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (sellerError || !sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    if (sellerProfile.status !== 'approved') {
      return NextResponse.json(
        { error: 'Your seller account is not approved yet' },
        { status: 403 }
      );
    }

    // Get seller's products
    const { data: products, error } = await client
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('seller_id', sellerProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch seller products: ${error.message}`);
    }

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch seller products' },
      { status: 500 }
    );
  }
}
