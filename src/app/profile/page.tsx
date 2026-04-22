'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Mail, ShoppingBag, Heart, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user from API
    fetch('/api/auth/check-session')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser({ email: data.user.email, full_name: data.user.full_name });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          {user ? (
            <Button variant="outline" asChild>
              <Link href="/auth">Sign Out</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth?redirect=/profile">Sign In</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.full_name || 'Guest User'}</p>
                    <p className="text-sm text-gray-500">{user?.email || 'Not logged in'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-600 border-0">
              <CardContent className="p-4 space-y-2">
                <Link href="/orders" className="flex items-center justify-between text-white hover:text-purple-100">
                  <span className="flex items-center"><ShoppingBag className="mr-3 h-5 w-5" />My Orders</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link href="/wishlist" className="flex items-center justify-between text-white hover:text-purple-100">
                  <span className="flex items-center"><Heart className="mr-3 h-5 w-5" />Wishlist</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{user?.full_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user?.email || 'Not logged in'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!user && (
              <Card className="mt-6">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Sign in to access all features</h3>
                  <p className="text-muted-foreground mb-4">Track orders, manage your wishlist, and more</p>
                  <Button asChild>
                    <Link href="/auth?redirect=/profile">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
