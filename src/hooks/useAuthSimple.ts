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

function getClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (globalClient) return globalClient;

  // Try to get from window (set by server)
  const win = window as any;
  if (win.__SUPABASE_URL__ && win.__SUPABASE_ANON_KEY__) {
    globalClient = createClient(win.__SUPABASE_URL__, win.__SUPABASE_ANON_KEY__, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return globalClient;
  }

  // Fallback to env vars (for local dev)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (url && key) {
    globalClient = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return globalClient;
  }

  return null;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize on mount
  useEffect(() => {
    const client = getClient();
    if (!client) {
      setLoading(false);
      return;
    }

    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
          });
          
          // Check admin via API with JWT
          try {
            const res = await fetch('/api/auth/check-admin', {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const data = await res.json();
            setIsAdmin(data.isAdmin === true);
          } catch (e) {
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (e) {
        console.error('Session check failed:', e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for changes
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
        });
        
        // Check admin
        try {
          const res = await fetch('/api/auth/check-admin', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        } catch (e) {
          setIsAdmin(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = getClient();
    if (!client) return { success: false, error: 'Not configured' };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    
    if (error) return { success: false, error: error.message };
    if (!data.user?.email_confirmed_at) return { success: false, error: 'Please verify your email' };
    
    return { success: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const client = getClient();
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
    const client = getClient();
    if (client) await client.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  }, [router]);

  return { user, isAdmin, loading, signIn, signUp, signOut };
}
