'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, ShoppingBag, Heart, LogOut, ChevronRight, Loader2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuthSimple';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: '' });

  useEffect(() => {
    if (user) {
      setFormData({ full_name: user.full_name || '' });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

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
          {user && (
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
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

            {!user && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">Sign in to access all features</p>
                  <Button asChild className="w-full">
                    <Link href="/auth?redirect=/profile">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {user && !editing && (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            {user && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">Change Password</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
