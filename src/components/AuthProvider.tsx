/**
 * AuthProvider Component
 * Provides authentication context to the entire app
 */

'use client';

import { ReactNode } from 'react';

export default function AuthProvider({ children }: { children: ReactNode }) {
  // The useAuth hook in each component handles initialization
  // This provider just wraps children
  // Auth state is managed globally through the hook's singleton pattern
  
  return <>{children}</>;
}
