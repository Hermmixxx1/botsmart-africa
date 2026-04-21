import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getEnvVar(name: string): string | undefined {
  return process.env[name];
}

function getSupabaseCredentials(): { url: string; anonKey: string; serviceKey?: string } | null {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 
              getEnvVar('COZE_SUPABASE_URL') ||
              getEnvVar('SUPABASE_URL');
  
  const anonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
                  getEnvVar('COZE_SUPABASE_ANON_KEY') ||
                  getEnvVar('SUPABASE_ANON_KEY');
  
  const serviceKey = getEnvVar('COZE_SUPABASE_SERVICE_ROLE_KEY') ||
                     getEnvVar('SUPABASE_SERVICE_ROLE_KEY') ||
                     getEnvVar('SERVICE_ROLE_KEY');

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey, serviceKey };
}

export function getSupabaseClient(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  
  if (!creds) {
    console.error('Missing Supabase credentials');
    return null;
  }

  // Use service role key for server-side, anon key as fallback
  const key = creds.serviceKey || creds.anonKey;

  return createClient(creds.url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

// Server-side - returns client or null (doesn't throw)
export function getSupabase(): SupabaseClient | null {
  return getSupabaseClient();
}

// Export credentials getter for direct use
export { getSupabaseCredentials };
