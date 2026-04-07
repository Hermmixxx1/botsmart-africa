import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

// POST /api/auth/signout - Sign out user
export async function POST(request: NextRequest) {
  try {
    await signOut();
    return NextResponse.json({ message: 'Signed out successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign out' },
      { status: 500 }
    );
  }
}
