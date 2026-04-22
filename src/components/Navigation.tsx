'use client';

import Link from 'next/link';
import { ShoppingBag, User, Menu, X, LogOut, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuthSimple';
import { SearchBar } from '@/components/SearchBar';
import { CurrencySelector } from '@/components/CurrencySelector';

export default function Navigation() {
  const { cart, getCartCount } = useStore();
  const { user, isAdmin, signOut, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            {user && (
              <>
                <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors">
                  Orders
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <SearchBar className="w-64" placeholder="Search products..." />
            <CurrencySelector />
            
            {user && (
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" title="Wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            )}

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

            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" size="icon" title="My Account">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <Link href="/" className="block text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/products" className="block text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
            {user && (
              <>
                <Link href="/profile" className="block text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
                <Link href="/orders" className="block text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Orders</Link>
                {isAdmin && (
                  <Link href="/admin" className="block text-sm font-medium text-purple-600" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                )}
              </>
            )}
            <div className="flex items-center space-x-4 pt-4 border-t">
              <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {getCartCount() > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {getCartCount()}
                    </Badge>
                  )}
                </Button>
              </Link>
              {user ? (
                <Button variant="ghost" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button><User className="h-4 w-4 mr-2" />Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
