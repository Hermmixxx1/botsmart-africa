import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// GET /api/seller/orders - Get seller's orders
export async function GET(request: NextRequest) {
  try {
    const client = getSupabase();
    const { data: { user } } = await client.auth.getUser();
    const { searchParams } = new URL(request.url);
    const payoutStatus = searchParams.get('payout_status');

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

    // Get order items for this seller
    let query = client
      .from('order_items')
      .select(`
        *,
        orders (
          id,
          order_number,
          status,
          payment_status,
          created_at
        )
      `)
      .eq('seller_id', sellerProfile.id)
      .order('created_at', { ascending: false });

    if (payoutStatus) {
      query = query.eq('payout_status', payoutStatus);
    }

    const { data: orderItems, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch seller orders: ${error.message}`);
    }

    // Calculate earnings
    const totalEarnings = orderItems?.reduce(
      (sum, item) => sum + parseFloat(item.seller_payout),
      0
    ) || 0;

    const pendingPayouts = orderItems?.filter(item => item.payout_status === 'pending').reduce(
      (sum, item) => sum + parseFloat(item.seller_payout),
      0
    ) || 0;

    return NextResponse.json({
      order_items: orderItems || [],
      total_earnings: totalEarnings,
      pending_payouts: pendingPayouts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch seller orders' },
      { status: 500 }
    );
  }
}
