import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Get current user from session using cookies (Server-side only)
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return null;
    }

    // Use the access token to get the user
    const client = getSupabaseClient(accessToken);
    const { data: { user }, error } = await client.auth.getUser();

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

// Sign in user (Server-side only)
export async function signIn(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(`Sign in failed: ${error.message}`);
  return data;
}

// Sign out user (Server-side only)
export async function signOut() {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) throw new Error(`Sign out failed: ${error.message}`);
}

// Check if user is authenticated (Server-side only)
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
