import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Support both NEXT_PUBLIC_ and COZE_ prefixed env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                        process.env.COZE_SUPABASE_URL ||
                        process.env.SUPABASE_URL;
    
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                            process.env.COZE_SUPABASE_ANON_KEY ||
                            process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/auth'));
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
            // Ignore errors in server components
          }
        },
      },
    });

    await supabase.auth.signOut();

    // Redirect to home after sign out
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
                    'https://botsmartafrica.com';
    
    return NextResponse.redirect(new URL('/', siteUrl));
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.redirect(new URL('/auth'));
  }
}
