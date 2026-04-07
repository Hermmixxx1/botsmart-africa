import { NextRequest, NextResponse } from 'next/server';
import { signUp, signIn, getCurrentUser } from '@/lib/auth';

// POST /api/auth/signup - Sign up a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const data = await signUp(email, password, fullName);
    return NextResponse.json({ user: data.user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 500 }
    );
  }
}
