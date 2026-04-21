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
 * Initialize Supabase client with fallback to config API
 */
async function initSupabaseClient(): Promise<SupabaseClient | null> {
  if (typeof window === 'undefined') return null;
  if (supabaseClient) return supabaseClient;
  if (clientInitPromise) return clientInitPromise;

  clientInitPromise = (async () => {
    // Try direct environment variables first
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If URL not available, fetch from config API
    if (!url || !key) {
      try {
        const response = await fetch('/api/config', { 
          credentials: 'include',
          cache: 'no-store'
        });
        if (response.ok) {
          const config = await response.json();
          console.log('Config fetched:', { 
            hasUrl: !!config.supabaseUrl, 
            hasKey: !!config.supabaseAnonKey 
          });
          url = url || config.supabaseUrl;
          key = key || config.supabaseAnonKey;
        } else {
          console.error('Config API failed:', response.status);
        }
      } catch (e) {
        console.error('Config API error:', e);
      }
    }

    if (!url || !key) {
      console.error('Supabase credentials not found:', { 
        envUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        envKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasUrl: !!url, 
        hasKey: !!key 
      });
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

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Initialize and listen for auth changes
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const supabase = await initSupabaseClient();
        
        if (!supabase) {
          if (mounted) setIsLoading(false);
          return;
        }

        // Initial session check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          setUserFromSession(session.user);
          await checkAdminStatus();
        } else if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setIsSeller(false);
          setIsLoading(false);
        }

        // Listen for auth state changes
        if (mounted) {
          subscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            
            if (event === 'SIGNED_IN' && session?.user) {
              setUserFromSession(session.user);
              await checkAdminStatus();
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setIsAdmin(false);
              setIsSeller(false);
            }
          }).data.subscription;
        }

        if (mounted) setIsLoading(false);
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

  // Helper to set user from session
  const setUserFromSession = (authUser: any) => {
    setUser({
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name,
      avatar_url: authUser.user_metadata?.avatar_url,
    });
  };

  // Check admin status via API
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = await initSupabaseClient();
      if (!supabase) return false;
      
      // Get session and pass JWT token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/auth/check-admin', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();
      
      const admin = data.isAdmin === true;
      setIsAdmin(admin);
      return admin;
    } catch (error) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
      return false;
    }
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = await initSupabaseClient();
    
    if (!supabase) {
      return { success: false, error: 'Authentication not configured. Please refresh the page.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user?.email_confirmed_at) {
        return { success: false, error: 'Please verify your email first' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const supabase = await initSupabaseClient();
    
    if (!supabase) {
      return { success: false, error: 'Authentication not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign up failed' };
    }
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
