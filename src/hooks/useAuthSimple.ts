/**
 * Simple Auth Hook - Client side auth with admin check
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

// Global state
let globalClient: SupabaseClient | null = null;
let cachedUser: User | null = null;
let cachedIsAdmin: boolean = false;
let authListeners: ((user: User | null, isAdmin: boolean) => void)[] = [];

function notifyListeners(user: User | null, isAdmin: boolean) {
  authListeners.forEach(listener => listener(user, isAdmin));
}

function subscribeAuthChanges(callback: (user: User | null, isAdmin: boolean) => void) {
  authListeners.push(callback);
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
}

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
      console.error('Config fetch failed');
    }
  }

  if (!url || !key) {
    console.error('No Supabase URL or Key');
    return null;
  }

  globalClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  return globalClient;
}

async function checkAdminStatus(): Promise<{ isAdmin: boolean; userId?: string; role?: string }> {
  try {
    const res = await fetch('/api/auth/check-admin', {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return { isAdmin: false };
    }
    
    const data = await res.json();
    return { isAdmin: data.isAdmin, userId: data.userId, role: data.role };
  } catch (e) {
    console.error('Admin check failed:', e);
    return { isAdmin: false };
  }
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isAdmin, setIsAdmin] = useState(cachedIsAdmin);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const client = await initClient();
      if (!client) {
        if (mounted) setLoading(false);
        return;
      }

      // Retry getting session a few times (cookies might not be set immediately)
      let session = null;
      for (let i = 0; i < 3; i++) {
        const { data } = await client.auth.getSession();
        if (data.session) {
          session = data.session;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
        };
        
        cachedUser = userData;
        if (mounted) setUser(userData);
        
        // Check admin status
        const adminStatus = await checkAdminStatus();
        cachedIsAdmin = adminStatus.isAdmin;
        if (mounted) setIsAdmin(adminStatus.isAdmin);
      }

      if (mounted) setLoading(false);

      // Subscribe to auth changes
      subscription = client.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
          };
          
          cachedUser = userData;
          if (mounted) setUser(userData);
          
          // Check admin status after sign in
          const adminStatus = await checkAdminStatus();
          cachedIsAdmin = adminStatus.isAdmin;
          if (mounted) setIsAdmin(adminStatus.isAdmin);
          notifyListeners(userData, adminStatus.isAdmin);
          
        } else if (event === 'SIGNED_OUT') {
          cachedUser = null;
          cachedIsAdmin = false;
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
          }
          notifyListeners(null, false);
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
    cachedUser = null;
    cachedIsAdmin = false;
    setUser(null);
    setIsAdmin(false);
    notifyListeners(null, false);
    router.push('/');
    router.refresh();
  }, [router]);

  return { user, isAdmin, loading, signIn, signUp, signOut };
}
