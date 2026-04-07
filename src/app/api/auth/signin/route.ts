import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

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
    return NextResponse.json({
      user: data.user,
      session: data.session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 401 }
    );
  }
}
