import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// GET /api/sellers/admin - List all seller profiles (admin only)
export async function GET(request: NextRequest) {
  try {
    const client = getSupabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status: pending, approved, rejected

    let query = client
      .from('seller_profiles')
      .select(`
        *,
        auth_user (
          email,
          raw_user_meta_data
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch seller profiles: ${error.message}`);
    }

    return NextResponse.json({ sellers: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch seller profiles' },
      { status: 500 }
    );
  }
}
