import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth-server';

// POST /api/auth/signin - Sign in user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const data = await signIn(email, password);

    // Set cookies for session persistence
    const response = NextResponse.json({
      user: data.user,
      session: data.session,
    });

    if (data.session) {
      // Set access token cookie
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in,
        path: '/',
      });

      // Set refresh token cookie
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 401 }
    );
  }
}
