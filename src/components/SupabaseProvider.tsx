'use client';

import { useEffect, useState } from 'react';
import { Inspector } from 'react-dev-inspector';

export function SupabaseProvider() {
  const [isReady, setIsReady] = useState(false);
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';
  const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY || '';

  useEffect(() => {
    // Set Supabase config on client side
    if (typeof window !== 'undefined') {
      (window as any).__SUPABASE_URL__ = supabaseUrl;
      (window as any).__SUPABASE_ANON_KEY__ = supabaseAnonKey;
    }
    setIsReady(true);
  }, [supabaseUrl, supabaseAnonKey]);

  if (!isReady) {
    // Render a hidden div to initialize client-side
    return <div className="hidden" suppressHydrationWarning />;
  }

  if (isDev) {
    return <Inspector />;
  }

  return null;
}
