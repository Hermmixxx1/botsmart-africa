import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// PATCH /api/sellers/admin/[id] - Approve or reject a seller (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    const { id } = await params;
    const body = await request.json();
    const { status, rejection_reason } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    if (status === 'rejected' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a seller' },
        { status: 400 }
      );
    }

    const updateData: { status: string; rejection_reason?: string } = { status };
    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    const { data, error } = await client
      .from('seller_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update seller status: ${error.message}`);
    }

    return NextResponse.json({ seller: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update seller status' },
      { status: 500 }
    );
  }
}

// GET /api/sellers/admin/[id] - Get seller details (admin only)
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

    const { data, error } = await client
      .from('seller_profiles')
      .select(`
        *,
        products (
          id,
          name,
          price,
          stock,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch seller details: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ seller: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch seller details' },
      { status: 500 }
    );
  }
}
