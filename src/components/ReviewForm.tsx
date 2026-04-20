"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StarRating } from "./StarRating";
import { useToast } from "@/lib/use-toast";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const rating = watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          rating: data.rating,
          title: data.title || undefined,
          comment: data.comment || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to submit review",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Your review has been submitted!",
      });
      reset();
      onSuccess?.();

      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold">Thank you for your review!</h3>
        <p className="text-muted-foreground mt-2">
          Your feedback helps other customers make better decisions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Rating *</label>
        <StarRating
          rating={rating}
          size={32}
          interactive
          onChange={(value) => setValue("rating", value)}
        />
        {errors.rating && (
          <p className="text-sm text-red-500">Please select a rating</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Review Title (Optional)</label>
        <Input
          {...register("title")}
          placeholder="Summarize your experience"
          maxLength={255}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your Review (Optional)</label>
        <Textarea
          {...register("comment")}
          placeholder="Share your thoughts about this product..."
          rows={4}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">
          Your review helps other customers make better decisions
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Review
      </Button>
    </form>
  );
}
