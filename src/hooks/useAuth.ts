/**
 * useAuth Hook - Single Source of Truth for Authentication
 * 
 * This hook provides:
 * - User state (logged in/out)
 * - Loading state
 * - Admin check
 * - Sign in/out functions
 * 
 * Usage:
 * const { user, isLoading, isAdmin, signIn, signOut } = useAuth();
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase';

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

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  // Initialize and listen for auth changes
  useEffect(() => {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserFromSession(session.user);
          await checkAdminStatus(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsSeller(false);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserFromSession(session.user);
        await checkAdminStatus(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setIsSeller(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUserFromSession(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
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
  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check-admin');
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
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return { success: false, error: 'Authentication not configured' };
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

      // onAuthStateChange will handle setting user
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const supabase = getSupabaseClient();
    
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
    const supabase = getSupabaseClient();
    
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

/**
 * Check admin status on server side (for API routes)
 */
export async function checkAdminOnServer(): Promise<{ isAdmin: boolean; userId?: string }> {
  try {
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return { isAdmin: false };
    }

    const { data: { user }, error } = await adminClient.auth.getUser();
    
    if (error || !user) {
      return { isAdmin: false };
    }

    // Check if user is in admin_users table
    const { data: adminUser } = await adminClient
      .from('admin_users')
      .select('id, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    return {
      isAdmin: !!adminUser,
      userId: user.id,
    };
  } catch (error) {
    console.error('Server admin check error:', error);
    return { isAdmin: false };
  }
}
