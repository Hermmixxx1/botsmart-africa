/**
 * AuthProvider Component
 * Provides authentication context to the entire app
 * Uses useAuth hook for centralized auth state management
 */

'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth - this sets up listeners and syncs state
  // The useAuth hook handles all auth state management
  useAuth();

  return <>{children}</>;
}
