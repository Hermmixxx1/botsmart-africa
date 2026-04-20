"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/use-toast";
import { getSupabaseClient } from "@/storage/database/supabase-client";

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
  const supabase = getSupabaseClient();

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  useEffect(() => {
    checkWishlist();
  }, [productId]);

  const checkWishlist = async () => {
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
    setIsLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: "Login Required",
          description: "Please login to add items to your wishlist",
        });
        return;
      }

      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?product_id=${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to remove from wishlist");
        }

        setIsInWishlist(false);
        toast({
          title: "Removed",
          description: "Item removed from your wishlist",
        });
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add to wishlist");
        }

        setIsInWishlist(true);
        toast({
          title: "Added!",
          description: "Item added to your wishlist",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
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
          "p-2 rounded-full bg-muted/50 animate-pulse",
          className
        )}
        disabled
      >
        <Heart size={iconSizes[size]} className="text-muted" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 rounded-full transition-all",
        isInWishlist
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          "transition-transform",
          isInWishlist && "fill-current scale-110",
          !isInWishlist && "hover:scale-110"
        )}
      />
      {showText && (
        <span className="text-sm font-medium pr-2">
          {isInWishlist ? "Wishlisted" : "Add to Wishlist"}
        </span>
      )}
    </button>
  );
}
