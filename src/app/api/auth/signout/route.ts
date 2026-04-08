import { NextResponse } from 'next/server';
import { signOut } from '@/lib/auth-server';

export async function POST() {
  try {
    await signOut();

    const response = NextResponse.redirect(new URL('/auth', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));

    // Clear cookies
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
    return NextResponse.redirect(new URL('/auth?error=signout_failed', baseUrl));
  }
}
