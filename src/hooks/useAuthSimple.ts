/**
 * Simple Auth - Minimal, reliable authentication
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

// Global client singleton
let globalClient: SupabaseClient | null = null;

// Async client initialization
async function initClient(): Promise<SupabaseClient | null> {
  if (globalClient) return globalClient;

  // Try env vars first
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fetch from config API if not in env
  if (!url || !key) {
    try {
      const res = await fetch('/api/config', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const config = await res.json();
        url = url || config.supabaseUrl;
        key = key || config.supabaseAnonKey;
      }
    } catch (e) {
      console.log('Config fetch failed');
    }
  }

  if (!url || !key) {
    console.error('No Supabase credentials found');
    return null;
  }

  globalClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  return globalClient;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const client = await initClient();
      if (!client || !mounted) {
        setLoading(false);
        return;
      }

      // Check current session
      const { data: { session } } = await client.auth.getSession();
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
        });
        
        // Check admin
        try {
          const res = await fetch('/api/auth/check-admin');
          const data = await res.json();
          console.log('Admin check result:', data);
          if (mounted) setIsAdmin(data.isAdmin === true);
        } catch (e) {
          console.error('Admin check failed:', e);
          if (mounted) setIsAdmin(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
        }
      }

      if (mounted) setLoading(false);

      // Listen for auth changes
      subscription = client.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
          });
          
          try {
            const res = await fetch('/api/auth/check-admin', {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const data = await res.json();
            if (mounted) setIsAdmin(data.isAdmin === true);
          } catch (e) {
            if (mounted) setIsAdmin(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
          }
        }
      }).data.subscription;
    };

    init();

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = await initClient();
    if (!client) return { success: false, error: 'Not configured' };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    
    if (error) return { success: false, error: error.message };
    if (!data.user?.email_confirmed_at) return { success: false, error: 'Please verify your email' };
    
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
    setUser(null);
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  }, [router]);

  return { user, isAdmin, loading, signIn, signUp, signOut };
}
