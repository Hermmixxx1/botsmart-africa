import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Create a Supabase server client from a request
export function createSupabaseServerClient(request: NextRequest) {
  // Create the Supabase client
  const supabase = createServerClient(
    process.env.COZE_SUPABASE_URL!,
    process.env.COZE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          const response = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  );

  return supabase;
}

// Get current user from session (for Server Components)
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Import request cookies at runtime to avoid issues
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const requestCookies = cookieStore.getAll();
    
    // Create a minimal request object
    const headers = new Headers();
    requestCookies.forEach(cookie => {
      headers.append('cookie', `${cookie.name}=${cookie.value}`);
    });
    
    const mockRequest = new NextRequest('http://localhost', {
      headers,
    });

    const supabase = createServerClient(
      process.env.COZE_SUPABASE_URL!,
      process.env.COZE_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return requestCookies;
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Ignore
            }
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Failed to get user:', error);
      return null;
    }

    return user as AuthUser | null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Sign in user (for API routes)
export async function signIn(email: string, password: string) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const requestCookies = cookieStore.getAll();
  
  const headers = new Headers();
  requestCookies.forEach(cookie => {
    headers.append('cookie', `${cookie.name}=${cookie.value}`);
  });
  
  const mockRequest = new NextRequest('http://localhost', {
    headers,
  });
  
  const supabase = createServerClient(
    process.env.COZE_SUPABASE_URL!,
    process.env.COZE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requestCookies;
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(`Sign in failed: ${error.message}`);
  return data;
}

// Sign out user
export async function signOut() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const requestCookies = cookieStore.getAll();
  
  const headers = new Headers();
  requestCookies.forEach(cookie => {
    headers.append('cookie', `${cookie.name}=${cookie.value}`);
  });
  
  const mockRequest = new NextRequest('http://localhost', {
    headers,
  });
  
  const supabase = createServerClient(
    process.env.COZE_SUPABASE_URL!,
    process.env.COZE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requestCookies;
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Sign out failed: ${error.message}`);
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
