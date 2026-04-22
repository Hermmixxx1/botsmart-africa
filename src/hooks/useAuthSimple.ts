/**
 * Simple Auth Hook - Client side auth with admin check
 * Uses both Supabase session AND explicit cookie fallback
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

const SESSION_COOKIE_NAME = 'botsmart_session';

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

// Store session info in a cookie (survives redirects)
function storeSessionCookie(userId: string, email: string, role?: string) {
  if (typeof document === 'undefined') return;
  
  const sessionData = JSON.stringify({ userId, email, role, timestamp: Date.now() });
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionData)};path=/;max-age=86400;SameSite=Lax`;
}

// Read session from cookie
function getSessionFromCookie(): { userId?: string; email?: string; role?: string } | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  
  try {
    const data = JSON.parse(decodeURIComponent(match[1]));
    // Check if session is less than 24 hours old
    if (Date.now() - data.timestamp > 86400000) return null;
    return data;
  } catch {
    return null;
  }
}

// Clear session cookie
function clearSessionCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE_NAME}=;path=/;max-age=0`;
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
      
      // First, check cookie for session (faster, survives redirects)
      const cookieSession = getSessionFromCookie();
      
      if (cookieSession?.userId) {
        // We have a cookie session - restore user from it
        cachedUser = { id: cookieSession.userId, email: cookieSession.email || '' };
        if (mounted) setUser(cachedUser);
        
        // Then check Supabase for full session
        if (client) {
          const { data: { session } } = await client.auth.getSession();
          
          if (session?.user) {
            // Update with actual Supabase user data
            cachedUser = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name,
            };
            if (mounted) setUser(cachedUser);
            
            // Check admin status
            const adminStatus = await checkAdminStatus();
            cachedIsAdmin = adminStatus.isAdmin;
            if (mounted) setIsAdmin(adminStatus.isAdmin);
            
            // Update cookie
            storeSessionCookie(session.user.id, session.user.email || '', adminStatus.role);
          } else {
            // Cookie exists but Supabase session expired - check admin anyway
            const adminStatus = await checkAdminStatus();
            if (mounted) setIsAdmin(adminStatus.isAdmin);
          }
        }
        
        if (mounted) setLoading(false);
        if (client) {
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
              
              const adminStatus = await checkAdminStatus();
              cachedIsAdmin = adminStatus.isAdmin;
              if (mounted) setIsAdmin(adminStatus.isAdmin);
              
              storeSessionCookie(session.user.id, session.user.email || '', adminStatus.role);
            } else if (event === 'SIGNED_OUT') {
              cachedUser = null;
              cachedIsAdmin = false;
              if (mounted) {
                setUser(null);
                setIsAdmin(false);
              }
              clearSessionCookie();
            }
          }).data.subscription;
        }
        return;
      }
      
      // No cookie - check Supabase directly
      if (!client) {
        if (mounted) setLoading(false);
        return;
      }

      const { data: { session } } = await client.auth.getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
        };
        
        cachedUser = userData;
        if (mounted) setUser(userData);
        
        storeSessionCookie(session.user.id, session.user.email || '');
        
        const adminStatus = await checkAdminStatus();
        cachedIsAdmin = adminStatus.isAdmin;
        if (mounted) setIsAdmin(adminStatus.isAdmin);
      }

      if (mounted) setLoading(false);

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
          
          storeSessionCookie(session.user.id, session.user.email || '');
          
          const adminStatus = await checkAdminStatus();
          cachedIsAdmin = adminStatus.isAdmin;
          if (mounted) setIsAdmin(adminStatus.isAdmin);
        } else if (event === 'SIGNED_OUT') {
          cachedUser = null;
          cachedIsAdmin = false;
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
          }
          clearSessionCookie();
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
    
    // Store session in cookie immediately after login
    storeSessionCookie(data.user.id, data.user.email || '');
    
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
    clearSessionCookie();
    router.push('/');
    router.refresh();
  }, [router]);

  return { user, isAdmin, loading, signIn, signUp, signOut };
}
