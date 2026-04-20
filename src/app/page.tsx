import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

async function getFeaturedProducts() {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
  const response = await fetch(`${baseUrl}/api/products?featured=true&limit=4`, {
    cache: 'no-store',
  });
  const data = await response.json();
  return data.products || [];
}

async function getCategories() {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
  const response = await fetch(`${baseUrl}/api/categories`, {
    cache: 'no-store',
  });
  const data = await response.json();
  return data.categories || [];
}

function ProductCard({ product }: { product: any }) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image_url}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
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
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">${parseFloat(product.price).toFixed(2)}</span>
        </div>
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
    <Link href={`/products?category=${category.slug}`} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-video overflow-hidden bg-muted">
          <Image
            src={category.image_url || '/placeholder.jpg'}
            alt={category.name}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardHeader>
          <CardTitle className="text-center text-xl">{category.name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="aspect-square" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Welcome to Botsmart Africa
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Southern Africa&apos;s trusted multi-vendor marketplace. Discover quality products from verified sellers across 12 countries, with secure payments and fast delivery.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/seller/register">
                  Become a Seller
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">Shop by Category</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category: any) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<FeaturedProductsSkeleton />}>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No featured products available at the moment.
              </div>
            )}
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Pan-African Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fast delivery across 12 Southern African countries. From South Africa to Tanzania, we've got you covered.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Verified Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Shop with confidence from vetted sellers. Every vendor is verified to ensure authentic products and quality service.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Local Currency Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pay in your preferred currency. We support ZAR, BWP, NAD, ZWL, MZN, and 8 other regional currencies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seller CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">Start Selling on Botsmart Africa</h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of sellers reaching customers across Southern Africa. Easy setup, low fees, powerful tools.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/seller/register">
              Register as a Seller
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
