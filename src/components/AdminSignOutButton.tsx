'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function AdminSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/auth');
        router.refresh();
      } else {
        console.error('Sign out failed');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
}
