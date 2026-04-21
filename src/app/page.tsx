import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PriceDisplay } from '@/components/PriceDisplay';
import { createClient } from '@supabase/supabase-js';

// Direct database access for server components
function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('Missing Supabase credentials');
    return null;
  }
  
  return createClient(url, key);
}

async function getFeaturedProducts() {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, description, price, image_url, stock, is_featured, category_id')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4);
    
  return data || [];
}

async function getCategories() {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .eq('is_active', true)
    .limit(8);
    
  return data || [];
}

function ProductCard({ product }: { product: any }) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-2 text-lg">{product.name}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < 4 ? 'fill-primary text-primary' : 'fill-muted text-muted'}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">(4.0)</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <PriceDisplay 
          price={parseFloat(product.price || 0)} 
          size="lg" 
          className="text-foreground"
        />
        {product.stock < 10 && product.stock > 0 && (
          <Badge variant="secondary" className="mt-2">
            Only {product.stock} left!
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild className="w-full">
          <Link href={`/products/${product.slug}`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function CategoryCard({ category }: { category: any }) {
  return (
    <Link href={`/products?category=${category.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary">
        <div className="aspect-square overflow-hidden bg-muted">
          {category.image_url ? (
            <Image
              src={category.image_url}
              alt={category.name}
              width={200}
              height={200}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground">
                {category.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-center text-lg">{category.name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardHeader className="p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-8 w-1/3" />
      </CardContent>
      <CardFooter className="p-4">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

function CategorySkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardHeader className="p-4">
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </CardHeader>
    </Card>
  );
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Welcome to <span className="text-primary">Botsmart Africa</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Discover quality products from trusted sellers across Southern Africa. 
              Shop from multiple vendors with secure payments and excellent customer service.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/seller/register">
                  Become a Seller
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8">
            <Suspense fallback={[...Array(8)].map((_, i) => <CategorySkeleton key={i} />)}>
              {categories.map((category: any) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </Suspense>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 ? (
        <section className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Suspense fallback={[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}>
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Suspense>
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">Get Started</h2>
            <p className="mb-8 text-muted-foreground">
              No products yet. Add products through the admin panel to get started.
            </p>
            <Button asChild size="lg">
              <Link href="/admin">
                Go to Admin Panel
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="mb-2 text-lg font-semibold">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                Your transactions are protected with industry-standard encryption
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">🚚</div>
              <h3 className="mb-2 text-lg font-semibold">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Reliable shipping across Southern Africa
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">💬</div>
              <h3 className="mb-2 text-lg font-semibold">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Our team is here to help you anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
