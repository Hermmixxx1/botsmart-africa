/**
 * useAuth Hook - Single Source of Truth for Authentication
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

// Client-side singleton
let supabaseClient: SupabaseClient | null = null;
let clientInitPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Initialize Supabase client
 */
async function initSupabaseClient(): Promise<SupabaseClient | null> {
  if (typeof window === 'undefined') return null;
  if (supabaseClient) return supabaseClient;
  if (clientInitPromise) return clientInitPromise;

  clientInitPromise = (async () => {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      try {
        const response = await fetch('/api/config', { 
          credentials: 'include',
          cache: 'no-store'
        });
        if (response.ok) {
          const config = await response.json();
          url = url || config.supabaseUrl;
          key = key || config.supabaseAnonKey;
        }
      } catch (e) {
        console.log('Config API not available');
      }
    }

    if (!url || !key) {
      console.error('Supabase credentials not found');
      return null;
    }

    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    return supabaseClient;
  })();

  return clientInitPromise;
}

/**
 * Check if user is admin (inline version)
 */
async function checkAdminInline(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch('/api/auth/check-admin', {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });
    const data = await response.json();
    return data.isAdmin === true;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Check admin status
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    const supabase = await initSupabaseClient();
    if (!supabase) return false;
    
    const admin = await checkAdminInline(supabase);
    setIsAdmin(admin);
    return admin;
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const supabase = await initSupabaseClient();
        
        if (!supabase) {
          if (mounted) setIsLoading(false);
          return;
        }

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });
          // Check admin status
          const admin = await checkAdminInline(supabase);
          if (mounted) setIsAdmin(admin);
        }

        if (mounted) setIsLoading(false);

        // Listen for auth changes
        subscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name,
              avatar_url: session.user.user_metadata?.avatar_url,
            });
            const admin = await checkAdminInline(supabase);
            if (mounted) setIsAdmin(admin);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAdmin(false);
            setIsSeller(false);
          }
        }).data.subscription;

      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = await initSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Authentication not configured. Please refresh the page.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user?.email_confirmed_at) {
      return { success: false, error: 'Please verify your email first' };
    }

    return { success: true };
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const supabase = await initSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Authentication not configured' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    const supabase = await initSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAdmin(false);
    setIsSeller(false);
    router.push('/');
    router.refresh();
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isSeller,
    signIn,
    signUp,
    signOut,
    checkAdminStatus,
  };
}
