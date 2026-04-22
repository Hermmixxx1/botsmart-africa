/**
 * Simple Auth Hook - No redirects, just state management
 * This hook does NOT redirect or block pages based on auth status
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

// Global state
let globalClient: SupabaseClient | null = null;
let cachedUser: User | null = null;

async function initClient(): Promise<SupabaseClient | null> {
  if (globalClient) return globalClient;

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    try {
      const res = await fetch('/api/config', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const config = await res.json();
        url = url || config.supabaseUrl;
        key = key || config.supabaseAnonKey;
      }
    } catch (e) {
      // Config fetch failed - will work without it
    }
  }

  if (!url || !key) {
    return null;
  }

  globalClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  return globalClient;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const client = await initClient();
      if (!client) {
        if (mounted) setLoading(false);
        return;
      }

      // Get current session
      const { data: { session } } = await client.auth.getSession();
      
      if (session?.user && mounted) {
        cachedUser = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
        };
        setUser(cachedUser);
      }

      if (mounted) setLoading(false);

      // Listen for auth changes
      client.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          cachedUser = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
          };
          setUser(cachedUser);
        } else if (event === 'SIGNED_OUT') {
          cachedUser = null;
          setUser(null);
        }
      });
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = await initClient();
    if (!client) return { success: false, error: 'Not configured' };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    
    if (error) return { success: false, error: error.message };
    
    return { success: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const client = await initClient();
    if (!client) return { success: false, error: 'Not configured' };

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    const client = await initClient();
    if (client) await client.auth.signOut();
    cachedUser = null;
    setUser(null);
  }, []);

  return { user, loading, signIn, signUp, signOut };
}
