import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Get current user from session (Client-side)
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const client = getSupabaseClient();
    
    // Get the session from localStorage or cookies
    const { data: { session }, error } = await client.auth.getSession();

    if (error) {
      console.error('Failed to get session:', error);
      return null;
    }

    if (!session) {
      return null;
    }

    const { data: { user }, error: userError } = await client.auth.getUser();

    if (userError) {
      console.error('Failed to get user:', userError);
      return null;
    }

    return user as AuthUser | null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Sign up new user
export async function signUp(email: string, password: string, fullName: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw new Error(`Sign up failed: ${error.message}`);
  return data;
}

// Sign in user
export async function signIn(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(`Sign in failed: ${error.message}`);
  return data;
}

// Sign out user
export async function signOut() {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) throw new Error(`Sign out failed: ${error.message}`);
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
