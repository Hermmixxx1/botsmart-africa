import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// GET /api/orders - List user's orders
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

    const { data, error } = await client
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          seller_payout,
          platform_fee,
          payout_status,
          product_name,
          product_image,
          seller_profiles (
            id,
            business_name,
            seller_type
          )
        ),
        addresses (
          id,
          full_name,
          address_line1,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return NextResponse.json({ orders: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const client = getSupabase();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shipping_address_id, notes, stripe_payment_intent_id } = body;

    if (!shipping_address_id) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Get cart items with product and seller info
    const { data: cartItems, error: cartError } = await client
      .from('cart_items')
      .select(`
        quantity,
        products (
          id,
          name,
          price,
          image_url,
          seller_id,
          seller_profiles (
            id,
            user_id
          )
        )
      `)
      .eq('user_id', user.id);

    if (cartError) {
      throw new Error(`Failed to fetch cart: ${cartError.message}`);
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => {
        const products = item.products as { price: string }[];
        const product = products[0];
        return sum + parseFloat(product.price) * item.quantity;
      },
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const shipping = 10; // Flat shipping rate
    const platform_fee = subtotal * 0.1; // 10% platform fee
    const total = subtotal + tax + shipping + platform_fee;

    // Generate order number
    const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        user_id: user.id,
        order_number,
        status: 'pending',
        total,
        subtotal,
        tax,
        shipping,
        platform_fee,
        payment_status: 'paid',
        payment_method: 'stripe',
        stripe_payment_intent_id,
        shipping_address_id,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items with seller payouts
    const orderItems = cartItems.map((item) => {
      const products = item.products as {
        id: string;
        seller_id: string;
        price: string;
        name: string;
        image_url: string;
      }[];
      const product = products[0];
      const itemTotal = parseFloat(product.price) * item.quantity;
      const itemPlatformFee = itemTotal * 0.1; // 10% platform fee per item
      const sellerPayout = itemTotal - itemPlatformFee;

      return {
        order_id: order.id,
        product_id: product.id,
        seller_id: product.seller_id,
        quantity: item.quantity,
        price: product.price,
        seller_payout: sellerPayout,
        platform_fee: itemPlatformFee,
        payout_status: 'pending',
        product_name: product.name,
        product_image: product.image_url,
      };
    });

    const { error: itemsError } = await client
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Clear cart
    const { error: clearError } = await client
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (clearError) {
      throw new Error(`Failed to clear cart: ${clearError.message}`);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}
