'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag, DollarSign, Users, Settings, LayoutDashboard, FileText, UserPlus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        router.push('/auth?redirect=/admin');
        return;
      }

      // Check if user is admin by checking admin_users table
      const response = await fetch('/api/auth/check-admin');
      const data = await response.json();
      
      if (!data.isAdmin) {
        router.push('/?error=not_admin');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth?redirect=/admin');
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/auth');
      router.refresh();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="flex items-center space-x-2">
                <LayoutDashboard className="h-6 w-6" />
                <span className="font-bold">Admin</span>
              </Link>

              <div className="hidden md:flex items-center space-x-4">
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
                <Link href="/admin/admins">
                  <Button variant="ghost" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Admins
                  </Button>
                </Link>
                <Link href="/admin/products">
                  <Button variant="ghost" size="sm">
                    <Package className="mr-2 h-4 w-4" />
                    Products
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                </Link>
                <Link href="/admin/sellers">
                  <Button variant="ghost" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Sellers
                  </Button>
                </Link>
                <Link href="/admin/pages">
                  <Button variant="ghost" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Pages
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
