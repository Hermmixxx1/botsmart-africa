import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function getSupabaseCredentials(): SupabaseCredentials | null {
  // Check various possible env var names for compatibility
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 
              process.env.SUPABASE_URL || 
              process.env.COZE_SUPABASE_URL ||
              process.env.NEXT_PUBLIC_COZE_SUPABASE_URL;
  
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_ANON_KEY || 
                   process.env.COZE_SUPABASE_ANON_KEY ||
                   process.env.NEXT_PUBLIC_COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing Supabase credentials:', { 
      hasUrl: !!url, 
      hasKey: !!anonKey,
      envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      cozeUrl: process.env.COZE_SUPABASE_URL
    });
    return null;
  }

  return { url, anonKey };
}

function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 
         process.env.COZE_SUPABASE_SERVICE_ROLE_KEY ||
         process.env.SERVICE_ROLE_KEY ||
         process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
}

export function getSupabaseClient(token?: string): SupabaseClient | null {
  const credentials = getSupabaseCredentials();
  
  if (!credentials) {
    return null;
  }

  const { url, anonKey } = credentials;
  const serviceRoleKey = getSupabaseServiceRoleKey();
  
  const key = token ? token : (serviceRoleKey || anonKey);

  if (token) {
    return createClient(url, key, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storageKey: 'supabase-auth',
      },
    });
  }

  return createClient(url, key, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'supabase-auth',
      detectSessionInUrl: true,
    },
  });
}

// For server-side API routes - throws if not available
export function getSupabase(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available. Check environment variables.');
  }
  return client;
}

export { getSupabaseCredentials, getSupabaseServiceRoleKey };
