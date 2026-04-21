import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Get or create Supabase client (works on both server and client)
let clientInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  // Use environment variables directly
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  clientInstance = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'supabase-auth',
    },
  });

  return clientInstance;
}

// Get current user from session
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const client = getSupabaseClient();
    
    if (!client) {
      return null;
    }
    
    const { data: { session }, error } = await client.auth.getSession();

    if (error) {
      console.error('Failed to get session:', error);
      return null;
    }

    if (!session) {
      return null;
    }

    return session.user as AuthUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Sign up new user
export async function signUp(email: string, password: string, fullName: string) {
  const client = getSupabaseClient();
  
  if (!client) {
    throw new Error('Authentication not ready. Please refresh the page.');
  }
  
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
  
  if (!client) {
    throw new Error('Authentication not ready. Please refresh the page.');
  }
  
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
  
  if (!client) {
    return;
  }
  
  const { error } = await client.auth.signOut();

  if (error) throw new Error(`Sign out failed: ${error.message}`);
}

// Get permissions for a user
export async function getUserPermissions(userId: string) {
  const client = getSupabaseClient();
  
  if (!client) {
    return null;
  }
  
  try {
    const { data, error } = await client
      .from('admin_users')
      .select('*, admin_roles(*)')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      isAdmin: true,
      role: data.admin_roles?.name || 'admin',
      permissions: data.admin_roles?.permissions || [],
    };
  } catch (error) {
    console.error('Error getting permissions:', error);
    return null;
  }
}
