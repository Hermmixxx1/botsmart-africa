/**
 * Sign Out API
 * POST /api/auth/signout
 * 
 * Signs out the current user and clears session
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      // If not configured, just redirect
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://botsmartafrica.com'));
    }

    const supabase = createSupabaseServerClient({
      getAll() {
        // Return empty - we'll clear all cookies
        return [];
      },
    });

    await supabase.auth.signOut();

    // Get site URL for redirect
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
                    'https://botsmartafrica.com';

    return NextResponse.redirect(new URL('/', siteUrl));

  } catch (error) {
    console.error('Sign out error:', error);
    // Even on error, redirect to home
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://botsmartafrica.com'));
  }
}
