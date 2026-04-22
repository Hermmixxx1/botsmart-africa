'use client';

import Link from 'next/link';
import { Package, ShoppingBag, Users, Settings, LayoutDashboard, FileText, UserPlus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthSimple';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="flex items-center space-x-2">
                <LayoutDashboard className="h-6 w-6" />
                <span className="font-bold">Botsmart Admin</span>
              </Link>

              <div className="hidden md:flex items-center space-x-4">
                <Link href="/admin"><Button variant="ghost" size="sm">Dashboard</Button></Link>
                <Link href="/admin/settings"><Button variant="ghost" size="sm"><Settings className="mr-2 h-4 w-4" />Settings</Button></Link>
                <Link href="/admin/admins"><Button variant="ghost" size="sm"><UserPlus className="mr-2 h-4 w-4" />Admins</Button></Link>
                <Link href="/admin/products"><Button variant="ghost" size="sm"><Package className="mr-2 h-4 w-4" />Products</Button></Link>
                <Link href="/admin/orders"><Button variant="ghost" size="sm"><ShoppingBag className="mr-2 h-4 w-4" />Orders</Button></Link>
                <Link href="/admin/sellers"><Button variant="ghost" size="sm"><Users className="mr-2 h-4 w-4" />Sellers</Button></Link>
                <Link href="/admin/pages"><Button variant="ghost" size="sm"><FileText className="mr-2 h-4 w-4" />Pages</Button></Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && <span className="text-sm text-gray-500">{user.email}</span>}
              <Button variant="ghost" size="sm" onClick={signOut}>
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
