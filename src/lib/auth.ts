import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Get current user from session
export async function getCurrentUser() {
  const client = getSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();

  if (error) throw new Error(`Failed to get user: ${error.message}`);
  return user as AuthUser | null;
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
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
