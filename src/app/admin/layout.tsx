import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserPermissions } from '@/lib/rbac';
import Link from 'next/link';
import { Package, ShoppingBag, DollarSign, Users, Settings, LayoutDashboard, FileText, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminSignOutButton } from '@/components/AdminSignOutButton';

// Tell Next.js to not statically build admin pages
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth?redirect=/admin');
  }

  const permissions = await getUserPermissions(user.id);

  if (!permissions || !permissions.isAdmin) {
    redirect('/?error=not_admin');
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

              <div className="flex items-center space-x-4">
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                {permissions.isSuperAdmin && (
                  <>
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
                  </>
                )}
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
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <AdminSignOutButton />
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
