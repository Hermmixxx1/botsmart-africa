"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/use-toast";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

async function fetchConfig(): Promise<SupabaseConfig | null> {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch config:', error);
  }
  return null;
}

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function WishlistButton({
  productId,
  className,
  size = "md",
  showText = false,
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // Initialize Supabase client
  useEffect(() => {
    async function initSupabase() {
      const config = await fetchConfig();
      if (config?.supabaseUrl && config?.supabaseAnonKey) {
        const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
        setSupabase(client);
      }
    }
    initSupabase();
  }, []);

  // Check wishlist status when supabase is ready
  useEffect(() => {
    if (supabase) {
      checkWishlist();
    }
  }, [productId, supabase]);

  const checkWishlist = async () => {
    if (!supabase) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsChecking(false);
        return;
      }

      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      setIsInWishlist(!!data);
    } catch (error) {
      console.error("Error checking wishlist:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const toggleWishlist = async () => {
    if (!supabase) {
      toast({
        title: "Error",
        description: "Please refresh the page and try again",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: "Please sign in",
          description: "You need to sign in to add items to your wishlist",
        });
        return;
      }

      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;

        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        });
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;

        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <button
        className={cn(
          "flex items-center gap-1.5 text-muted-foreground",
          className
        )}
        disabled
      >
        <Heart className={cn("animate-pulse", iconSizes[size] === 16 && "h-4 w-4")} />
        {showText && <span className="text-sm">Loading...</span>}
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        isInWishlist ? "text-red-500" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size] === 16 && "h-4 w-4",
          iconSizes[size] === 20 && "h-5 w-5",
          iconSizes[size] === 24 && "h-6 w-6",
          isInWishlist && "fill-current"
        )}
      />
      {showText && (
        <span className="text-sm">
          {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
        </span>
      )}
    </button>
  );
}
