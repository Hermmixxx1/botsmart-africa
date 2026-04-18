'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, FileText, Settings, Layout, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: string;
  totalProducts: number;
  totalSellers: number;
  pendingSellers: number;
  totalCustomers: number;
}

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: '0',
    totalProducts: 0,
    totalSellers: 0,
    pendingSellers: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/auth');
      return;
    }
  };

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, sellersRes] = await Promise.all([
        fetch('/api/admin/orders?role=super_admin'),
        fetch('/api/admin/products?role=super_admin'),
        fetch('/api/admin/sellers?role=super_admin'),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const totalRevenue = (ordersData.orders || []).reduce((sum: number, order: { total: string }) =>
          sum + parseFloat(order.total || '0'), 0);
        setStats(prev => ({
          ...prev,
          totalOrders: (ordersData.orders || []).length,
          totalRevenue: totalRevenue.toString(),
        }));
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setStats(prev => ({
          ...prev,
          totalProducts: (productsData.products || []).length,
        }));
      }

      if (sellersRes.ok) {
        const sellersData = await sellersRes.json();
        const pending = (sellersData.sellers || []).filter((s: { status: string }) => s.status === 'pending').length;
        setStats(prev => ({
          ...prev,
          totalSellers: (sellersData.sellers || []).length,
          pendingSellers: pending,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-10 w-10" />
            Botsmart Africa Super Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Full control over Southern Africa&apos;s premier marketplace
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${parseFloat(stats.totalRevenue).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Products listed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSellers}</div>
              <p className="text-xs text-muted-foreground">Registered sellers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingSellers}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Fee</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10%</div>
              <p className="text-xs text-muted-foreground">Default commission</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-20 flex flex-col gap-2">
                <Link href="/admin/settings">
                  <Settings className="h-6 w-6" />
                  Site Settings
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link href="/admin/admins">
                  <Users className="h-6 w-6" />
                  Manage Admins
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link href="/admin/pages">
                  <FileText className="h-6 w-6" />
                  Manage Pages
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link href="/admin/sellers">
                  <Users className="h-6 w-6" />
                  Approve Sellers
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Admin Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Link href="/admin/products">
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Products Management
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="ghost" className="w-full justify-start">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Orders Management
                </Button>
              </Link>
              <Link href="/admin/sellers">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Sellers Management
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="ghost" className="w-full justify-start">
                  <Layout className="mr-2 h-4 w-4" />
                  Categories Management
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
