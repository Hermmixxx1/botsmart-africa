'use client';

import Link from 'next/link';
import { ShoppingBag, User, Menu, X, LogOut, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CurrencySelector } from '@/components/CurrencySelector';

export default function Navigation() {
  const { cart, getCartCount } = useStore();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check for user session without blocking
    fetch('/api/auth/check-session')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser({ email: data.user.email });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xl font-bold">Botsmart Africa</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors">
              Orders
            </Link>
            <Link href="/admin" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
              Admin
            </Link>
            <Link href="/seller/dashboard" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
              Seller
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <SearchBar className="w-64" placeholder="Search products..." />
            <CurrencySelector />
            
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" title="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {getCartCount()}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/auth">
              <Button>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-sm font-medium">Home</Link>
              <Link href="/products" className="text-sm font-medium">Products</Link>
              <Link href="/orders" className="text-sm font-medium">Orders</Link>
              <Link href="/admin" className="text-sm font-medium text-purple-600">Admin</Link>
              <Link href="/seller/dashboard" className="text-sm font-medium text-green-600">Seller</Link>
              <Link href="/auth" className="text-sm font-medium">Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
