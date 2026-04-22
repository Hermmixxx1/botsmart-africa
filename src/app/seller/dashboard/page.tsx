'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, DollarSign, Clock, CheckCircle2, XCircle, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SellerProfile {
  id: string;
  seller_type: string;
  status: string;
  business_name: string | null;
  rejection_reason: string | null;
}

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  is_active: boolean;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  seller_payout: string;
  payout_status: string;
  product_name: string;
  created_at: string;
  orders: {
    order_number: string;
    status: string;
    payment_status: string;
    created_at: string;
  };
}

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch seller profile
      const profileRes = await fetch('/api/sellers');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.seller);
      }

      // Fetch products
      const productsRes = await fetch('/api/seller/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products);
      }

      // Fetch orders
      const ordersRes = await fetch('/api/seller/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrderItems(ordersData.order_items);
        setStats({
          totalEarnings: ordersData.total_earnings,
          pendingPayouts: ordersData.pending_payouts,
          totalOrders: ordersData.order_items?.length || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-2">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-4xl font-bold tracking-tight">Seller Dashboard</h1>
            <p className="text-muted-foreground">
              {profile?.business_name || 'Individual Seller'}
            </p>
          </div>
          <Button asChild disabled={profile?.status !== 'approved'}>
            <Link href="/seller/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Status Card */}
        {profile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {getStatusIcon(profile.status)}
                <div>
                  <Badge className={getStatusColor(profile.status)}>
                    {profile.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.status === 'pending' &&
                      'Your account is under review. You will be able to sell once approved.'}
                    {profile.status === 'rejected' &&
                      `Your account was rejected: ${profile.rejection_reason}`}
                    {profile.status === 'approved' &&
                      'Your account is approved and you can start selling!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Orders received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.pendingPayouts.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting transfer</p>
            </CardContent>
          </Card>
        </div>

        {/* Products and Orders */}
        {profile?.status === 'approved' && (
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Package className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No products yet</h2>
                    <p className="text-muted-foreground mb-6">
                      Start by adding your first product
                    </p>
                    <Button asChild>
                      <Link href="/seller/products/new">Add First Product</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${parseFloat(product.price).toFixed(2)} • Stock: {product.stock}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              {orderItems.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Package className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                    <p className="text-muted-foreground">
                      Orders will appear here once customers purchase your products
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{item.product_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Order: {item.orders.order_number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              ${(parseFloat(item.seller_payout)).toFixed(2)}
                            </p>
                            <Badge
                              variant={item.payout_status === 'paid' ? 'default' : 'secondary'}
                            >
                              {item.payout_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="border-t pt-4 flex justify-between text-sm">
                          <span>Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</span>
                          <span className="text-muted-foreground">
                            Customer order status: {item.orders.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!profile && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No Seller Account</h2>
              <p className="text-muted-foreground mb-6">
                Register as a seller to start selling products
              </p>
              <Button asChild>
                <Link href="/seller/register">Register as Seller</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
