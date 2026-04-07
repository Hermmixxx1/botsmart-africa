'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ShoppingCart, Minus, Plus, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';

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
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      setProduct(data.product || null);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
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
            <div className="aspect-square animate-pulse bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse bg-muted" />
              <div className="h-4 w-1/2 animate-pulse bg-muted" />
              <div className="h-6 w-1/3 animate-pulse bg-muted" />
              <div className="h-32 w-full animate-pulse bg-muted" />
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

  const discount = product.compare_price
    ? Math.round(
        ((parseFloat(product.compare_price) - parseFloat(product.price)) /
          parseFloat(product.compare_price)) *
          100
      )
    : 0;

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
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image_url}
                alt={product.name}
                width={800}
                height={800}
                className="h-full w-full object-cover"
              />
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
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'fill-primary text-primary' : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.0)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.compare_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${parseFloat(product.compare_price).toFixed(2)}
                  </span>
                  <Badge variant="destructive">{discount}% OFF</Badge>
                </>
              )}
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold mb-2">
                {product.stock > 0 ? (
                  <span className="text-green-600">
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600">✗ Out of Stock</span>
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
      </div>
    </div>
  );
}
