'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ShoppingCart, Minus, Plus, Star, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import { WishlistButton } from '@/components/WishlistButton';
import { StarRating, RatingSummary } from '@/components/StarRating';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import type { Review, ReviewStats } from '@/types/review';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_price: string | null;
  image_url: string;
  images: string[];
  stock: number;
  is_featured: boolean;
  categories: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
      fetchReviews();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${params.slug}`);
      const data = await response.json();
      setProduct(data.product || null);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?product_id=${params.slug}&limit=10`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setReviewStats({
        average_rating: data.average_rating || 0,
        total: data.total || 0,
        rating_distribution: data.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      product_id: product.id,
      quantity,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image_url,
      slug: product.slug,
    });
  };

  const updateQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(product?.stock || 1, prev + delta)));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image_url}
                alt={product.name}
                width={800}
                height={800}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <WishlistButton productId={product.id} size="lg" />
              </div>
            </div>
            {product.images && product.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded bg-muted"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.categories && (
                <Badge variant="secondary" className="mb-2">
                  {product.categories.name}
                </Badge>
              )}
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <StarRating rating={reviewStats?.average_rating || 0} />
                <span className="text-sm text-muted-foreground">
                  ({reviewStats?.total || 0} review{reviewStats?.total !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">
                ${parseFloat(product.price).toFixed(2)}
              </span>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold mb-2">
                {product.stock > 0 ? (
                  <span className="text-green-600">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-16 text-center text-lg font-semibold">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <WishlistButton productId={product.id} size="lg" showText />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Free shipping on orders over $50. Estimated delivery: 3-5 business days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="reviews">
                Reviews ({reviewStats?.total || 0})
              </TabsTrigger>
              <TabsTrigger value="write-review">
                Write a Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-6">
              {reviewStats && reviewStats.total > 0 && (
                <div className="mb-8 p-6 bg-muted/50 rounded-lg">
                  <RatingSummary
                    average={reviewStats.average_rating}
                    total={reviewStats.total}
                    distribution={reviewStats.rating_distribution}
                  />
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="divide-y">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to review this product
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const writeTab = document.querySelector('[value="write-review"]') as HTMLButtonElement;
                      writeTab?.click();
                    }}
                  >
                    Write a Review
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="write-review" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <ReviewForm
                    productId={product.id}
                    onSuccess={fetchReviews}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
