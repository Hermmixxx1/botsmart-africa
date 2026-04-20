"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/lib/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImportResult {
  id: string;
  name: string;
  slug: string;
  price: string;
  original_price: number;
  compare_price: number | null;
  markup_applied: number;
  image_url: string;
  source_url: string;
}

export function AIProductImport() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [markupPercentage, setMarkupPercentage] = useState(15);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleImport = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to import",
        variant: "destructive",
      });
      return;
    }

    setFetchingUrl(true);
    try {
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          category_id: categoryId || undefined,
          markup_percentage: markupPercentage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import product");
      }

      setPreview(data.product);
      setShowConfirm(true);
      toast({
        title: "Product Preview",
        description: "Review the imported product details below",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import product",
        variant: "destructive",
      });
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    try {
      // The product is already saved, just close the dialog
      setShowConfirm(false);
      setPreview(null);
      setUrl("");

      toast({
        title: "Product Imported!",
        description: "The product has been added to your inventory",
      });

      // Refresh the products list
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete import",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Product Import
        </CardTitle>
        <CardDescription>
          Import products from any website with automatic AI extraction and pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="import-url">Product URL</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="import-url"
                type="url"
                placeholder="https://example.com/product-page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleImport}
              disabled={!url || fetchingUrl}
              className="shrink-0"
            >
              {fetchingUrl ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Fetch & Import
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="markup">Markup Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="markup"
                type="number"
                min="0"
                max="100"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                % will be added to original price
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg space-y-2">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">How it works</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Enter a product URL from any e-commerce website</li>
                <li>2. Our AI will extract product name, description, images, and price</li>
                <li>3. The specified markup percentage will be added to the price</li>
                <li>4. The product will be added to your inventory</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Product Import Preview
              </DialogTitle>
              <DialogDescription>
                Review the extracted product information before confirming
              </DialogDescription>
            </DialogHeader>

            {preview && (
              <div className="space-y-6">
                {/* Image */}
                <div className="flex gap-6">
                  {preview.image_url ? (
                    <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={preview.image_url}
                        alt={preview.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{preview.name}</h3>
                      <a
                        href={preview.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {preview.source_url.substring(0, 50)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          ${parseFloat(preview.price).toFixed(2)}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          ${preview.original_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          +{preview.markup_applied}% markup applied
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Import Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Price:</span>
                      <span>${preview.original_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Markup:</span>
                      <span>+{preview.markup_applied}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Final Price:</span>
                      <span className="font-bold">${parseFloat(preview.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit per sale:</span>
                      <span className="text-green-600 font-medium">
                        ${(parseFloat(preview.price) - preview.original_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setPreview(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmImport} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Import
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
