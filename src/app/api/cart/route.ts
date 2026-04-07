import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await client
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          slug,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }

    return NextResponse.json({ cart: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
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
    const { product_id, quantity } = body;

    if (!product_id || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const { data: existing } = await client
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .maybeSingle();

    let cartItem;

    if (existing) {
      // Update quantity
      const { data, error } = await client
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update cart: ${error.message}`);
      cartItem = data;
    } else {
      // Add new item
      const { data, error } = await client
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id,
          quantity,
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to add to cart: ${error.message}`);
      cartItem = data;
    }

    return NextResponse.json({ cart_item: cartItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add to cart' },
      { status: 500 }
    );
  }
}
