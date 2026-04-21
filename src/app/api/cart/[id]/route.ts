import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// PUT /api/cart/[id] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    const { data: { user } } = await client.auth.getUser();
    const { id } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }

    return NextResponse.json({ cart_item: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    const { data: { user } } = await client.auth.getUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error } = await client
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to remove cart item: ${error.message}`);
    }

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
