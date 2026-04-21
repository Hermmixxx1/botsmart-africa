import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// POST /api/auth/verify-phone - Verify phone with OTP
export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    const client = getSupabase();
    
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Verify the OTP for phone
    const { data, error } = await client.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Phone verified successfully',
      user: data.user ? { id: data.user.id } : null
    });
  } catch (error: any) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
