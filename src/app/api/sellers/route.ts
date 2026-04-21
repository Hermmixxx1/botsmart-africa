import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// POST /api/sellers/register - Register as a seller
export async function POST(request: NextRequest) {
  try {
    const client = getSupabase();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      seller_type, // 'individual' or 'business'
      business_name,
      registration_number,
      tax_id,
      bank_account_name,
      bank_account_number,
      bank_routing_number,
    } = body;

    // Validate required fields
    if (!seller_type || !['individual', 'business'].includes(seller_type)) {
      return NextResponse.json(
        { error: 'Invalid seller type. Must be "individual" or "business"' },
        { status: 400 }
      );
    }

    if (seller_type === 'business') {
      if (!business_name || !registration_number) {
        return NextResponse.json(
          { error: 'Business name and registration number are required for business sellers' },
          { status: 400 }
        );
      }
    }

    if (!bank_account_name || !bank_account_number || !bank_routing_number) {
      return NextResponse.json(
        { error: 'Bank account information is required' },
        { status: 400 }
      );
    }

    // Check if user already has a seller profile
    const { data: existing } = await client
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a seller profile' },
        { status: 400 }
      );
    }

    // Create seller profile
    const { data, error } = await client
      .from('seller_profiles')
      .insert({
        user_id: user.id,
        seller_type,
        status: 'pending', // Business sellers need approval
        business_name: business_name || null,
        registration_number: registration_number || null,
        tax_id: tax_id || null,
        bank_account_name,
        bank_account_number,
        bank_routing_number,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create seller profile: ${error.message}`);
    }

    return NextResponse.json({ seller: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register as seller' },
      { status: 500 }
    );
  }
}

// GET /api/sellers/profile - Get current user's seller profile
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
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch seller profile: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No seller profile found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ seller: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch seller profile' },
      { status: 500 }
    );
  }
}
