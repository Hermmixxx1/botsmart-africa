/**
 * Supabase Client Factory
 * Single source for creating Supabase clients
 * Supports both client-side and server-side (SSR) usage
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Environment variable helper
function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 
              process.env.COZE_SUPABASE_URL ||
              process.env.SUPABASE_URL;
  
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                  process.env.COZE_SUPABASE_ANON_KEY ||
                  process.env.SUPABASE_ANON_KEY;
  
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.SERVICE_ROLE_KEY;

  return { url: url || '', anonKey: anonKey || '', serviceKey: serviceKey || '' };
}

// Client-side singleton
let browserClient: SupabaseClient | null = null;

/**
 * Get Supabase client for browser/client-side usage
 * Uses window object to detect browser environment
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    // Server-side - use createServerClient instead
    console.warn('getSupabaseClient() called on server. Use createSupabaseServerClient() instead.');
    return null;
  }

  if (browserClient) return browserClient;

  const { url, anonKey } = getSupabaseEnv();
  
  if (!url || !anonKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'supabase-auth', // Custom storage key to avoid conflicts
    },
  });

  return browserClient;
}

/**
 * Create Supabase server client for middleware and API routes
 * Properly handles cookies for SSR
 */
export function createSupabaseServerClient(
  cookies: {
    getAll: () => { name: string; value: string }[];
    setAll?: (cookies: { name: string; value: string; options?: object }[]) => void;
  }
) {
  const { url, anonKey } = getSupabaseEnv();
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookies.getAll();
      },
      setAll(cookiesToSet) {
        if (cookies.setAll) {
          cookies.setAll(cookiesToSet);
        }
      },
    },
  });
}

/**
 * Get service role client for admin operations (bypasses RLS)
 * ONLY use on server-side, NEVER expose to client
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const { url, serviceKey } = getSupabaseEnv();
  
  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  return !!(url && anonKey);
}
