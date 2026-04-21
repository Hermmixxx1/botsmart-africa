import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST /api/auth/resend-phone-code - Resend phone verification OTP
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // Send new OTP for phone verification
    const { error } = await client.auth.signInWithOtp({
      phone,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent'
    });
  } catch (error: any) {
    console.error('Resend phone code error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send code' },
      { status: 500 }
    );
  }
}
