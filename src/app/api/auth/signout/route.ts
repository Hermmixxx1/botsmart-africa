import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.COZE_SUPABASE_URL!,
      process.env.COZE_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Ignore errors
            }
          },
        },
      }
    );

    await supabase.auth.signOut();

    return NextResponse.redirect(new URL('/auth', process.env.NEXT_PUBLIC_SITE_URL || 'https://botsmart-africa-krdn5eesh-hermix-lebogangs-projects.vercel.app'));
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.redirect(new URL('/auth?error=signout_failed', process.env.NEXT_PUBLIC_SITE_URL || 'https://botsmart-africa-krdn5eesh-hermix-lebogangs-projects.vercel.app'));
  }
}
