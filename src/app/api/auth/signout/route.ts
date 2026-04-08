import { NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

export async function POST() {
  try {
    await signOut();

    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
    return NextResponse.redirect(new URL('/auth', baseUrl));
  } catch (error) {
    console.error('Sign out error:', error);
    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
    return NextResponse.redirect(new URL('/auth?error=signout_failed', baseUrl));
  }
}
