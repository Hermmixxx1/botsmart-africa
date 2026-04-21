import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Cache for config
let cachedConfig: SupabaseConfig | null = null;

async function fetchConfig(): Promise<SupabaseConfig | null> {
  if (cachedConfig) return cachedConfig;
  
  try {
    const response = await fetch('/api/config', {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      cachedConfig = {
        supabaseUrl: data.supabaseUrl,
        supabaseAnonKey: data.supabaseAnonKey,
      };
      return cachedConfig;
    }
  } catch (error) {
    console.error('Failed to fetch config:', error);
  }
  return null;
}

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
    const client = await getClient();
    
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
  const client = await getClient();
  
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
  const client = await getClient();
  
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
  const client = await getClient();
  
  if (!client) {
    return;
  }
  
  const { error } = await client.auth.signOut();

  if (error) throw new Error(`Sign out failed: ${error.message}`);
}

// Get or create Supabase client
let clientPromise: Promise<SupabaseClient | null> | null = null;

async function getClient(): Promise<SupabaseClient | null> {
  // For server-side, create client directly with env vars
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      return null;
    }
    
    return createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  
  // For client-side, use config endpoint
  if (!clientPromise) {
    clientPromise = (async () => {
      const config = await fetchConfig();
      
      if (!config || !config.supabaseUrl || !config.supabaseAnonKey) {
        console.error('Missing Supabase config');
        return null;
      }
      
      return createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      });
    })();
  }
  
  return clientPromise;
}

// Get permissions for a user
export async function getUserPermissions(userId: string) {
  const client = await getClient();
  
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

// Check if user is admin
export async function isAdmin(userId: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions?.isAdmin || false;
}
