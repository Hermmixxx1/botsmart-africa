"use client";

import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "@/types/review";

interface ReviewCardProps {
  review: Review & {
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const authorName = review.profiles?.full_name || "Anonymous";
  const timeAgo = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
  });

  return (
    <div className="py-6 border-b last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {review.profiles?.avatar_url ? (
              <img
                src={review.profiles.avatar_url}
                alt={authorName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium">
                {authorName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium">{authorName}</p>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size={14} />
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
          </div>
        </div>
        {review.is_verified_purchase && (
          <Badge variant="secondary" className="text-xs">
            Verified Purchase
          </Badge>
        )}
      </div>

      {review.title && (
        <h4 className="font-medium mt-4 mb-2">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-muted-foreground whitespace-pre-line">
          {review.comment}
        </p>
      )}
    </div>
  );
}
