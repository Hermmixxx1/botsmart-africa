'use client';

import { useEffect } from 'react';
import { Inspector } from 'react-dev-inspector';

export function SupabaseProvider() {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';
  const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY || '';

  useEffect(() => {
    // Set Supabase config on client side only
    window.__SUPABASE_URL__ = supabaseUrl;
    window.__SUPABASE_ANON_KEY__ = supabaseAnonKey;
  }, [supabaseUrl, supabaseAnonKey]);

  if (isDev) {
    return <Inspector />;
  }

  return null;
}
