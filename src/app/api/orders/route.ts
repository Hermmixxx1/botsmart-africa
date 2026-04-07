import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/orders - List user's orders
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
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          product_name,
          product_image
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
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
    const { shipping_address_id, notes, stripe_payment_intent_id } = body;

    if (!shipping_address_id) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Get cart items
    const { data: cartItems, error: cartError } = await client
      .from('cart_items')
      .select(`
        quantity,
        products (
          id,
          name,
          price,
          image_url
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
      (sum, item) => sum + parseFloat(item.products.price) * item.quantity,
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const shipping = 10; // Flat shipping rate
    const total = subtotal + tax + shipping;

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

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      price: item.products.price,
      product_name: item.products.name,
      product_image: item.products.image_url,
    }));

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
