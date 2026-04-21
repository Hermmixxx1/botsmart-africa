'use client';

import { useEffect, useState } from 'react';

export function SupabaseInit() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set Supabase config on client side only
    const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY || '';
    
    if (typeof window !== 'undefined') {
      (window as any).__SUPABASE_URL__ = supabaseUrl;
      (window as any).__SUPABASE_ANON_KEY__ = supabaseAnonKey;
    }
    
    setMounted(true);
  }, []);

  // Return null after mount to avoid any SSR mismatch
  if (mounted) {
    return null;
  }

  // Return empty div during SSR to maintain structure
  return <div suppressHydrationWarning />;
}
