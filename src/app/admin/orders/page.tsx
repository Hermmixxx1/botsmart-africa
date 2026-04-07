'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: string;
  product_name: string;
  product_image: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: string;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/auth');
      return;
    }
  };

  const fetchOrders = async () => {
    try {
      // In a real app, you'd have an admin endpoint
      // For now, we'll show a placeholder
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              Orders will appear here once customers start purchasing
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
