"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1;
        const filled = value <= rating;
        const halfFilled = !filled && value - 0.5 <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(value)}
            className={cn(
              "transition-colors",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default",
              !interactive && "pointer-events-none"
            )}
          >
            <Star
              size={size}
              className={cn(
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : halfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "fill-transparent text-gray-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// Rating summary component
interface RatingSummaryProps {
  average: number;
  total: number;
  distribution: { [key: number]: number };
  onBarClick?: (rating: number) => void;
}

export function RatingSummary({
  average,
  total,
  distribution,
  onBarClick,
}: RatingSummaryProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      <div className="flex flex-col items-center">
        <span className="text-5xl font-bold">{average.toFixed(1)}</span>
        <StarRating rating={average} />
        <span className="text-sm text-muted-foreground mt-1">
          {total} review{total !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex-1 space-y-2 w-full sm:w-48">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <button
              key={star}
              onClick={() => onBarClick?.(star)}
              className="flex items-center gap-2 w-full hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
            >
              <span className="text-sm w-6">{star}</span>
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
