"use client";

import { useEffect, useState } from "react";
import { Star, Check, X, Trash2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/lib/use-toast";
import { StarRating } from "@/components/StarRating";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const limit = 20;

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/reviews?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch reviews");
      }

      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (review: Review) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve review");
      }

      toast({
        title: "Success",
        description: "Review approved successfully",
      });

      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve review",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (review: Review) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject review");
      }

      toast({
        title: "Success",
        description: "Review rejected",
      });

      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject review",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      toast({
        title: "Success",
        description: "Review deleted successfully",
      });

      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.products?.name.toLowerCase().includes(query) ||
      review.user?.full_name?.toLowerCase().includes(query) ||
      review.user?.email.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query)
    );
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage product reviews and ratings
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {pendingCount} pending approval
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by product, user, or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                onClick={() => setStatusFilter("approved")}
              >
                Approved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Reviews Found</h3>
            <p className="text-muted-foreground mt-1">
              {statusFilter === "pending"
                ? "No reviews pending approval"
                : "No reviews match your search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Product & User Info */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="text-sm text-muted-foreground">Product</p>
                        <p className="font-medium">{review.products?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">User</p>
                        <p className="font-medium">
                          {review.user?.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.user?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <StarRating rating={review.rating} size={16} />
                      </div>
                    </div>

                    {/* Review Content */}
                    {review.title && (
                      <p className="font-semibold">{review.title}</p>
                    )}
                    {review.comment && (
                      <p className="text-muted-foreground line-clamp-2">
                        {review.comment}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={review.is_approved ? "default" : "secondary"}>
                        {review.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      {review.is_verified_purchase && (
                        <Badge variant="outline">Verified Purchase</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!review.is_approved && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(review)}
                        disabled={isProcessing}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {review.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(review)}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedReview(review)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(review)}
                      disabled={isProcessing}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Full review from {selectedReview?.user?.full_name || "Anonymous"}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{selectedReview.products?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">
                    {selectedReview.user?.full_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedReview.user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <StarRating rating={selectedReview.rating} size={20} />
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant={selectedReview.is_approved ? "default" : "secondary"}>
                  {selectedReview.is_approved ? "Approved" : "Pending"}
                </Badge>
                {selectedReview.is_verified_purchase && (
                  <Badge variant="outline">Verified Purchase</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(selectedReview.created_at).toLocaleString()}
                </span>
              </div>

              {selectedReview.title && (
                <div>
                  <p className="text-sm font-medium">Title</p>
                  <p>{selectedReview.title}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">Comment</p>
                <Textarea readOnly value={selectedReview.comment || "No comment"} />
              </div>
            </div>
          )}

          <DialogFooter>
            {!selectedReview?.is_approved && (
              <Button onClick={() => handleApprove(selectedReview!)}>
                Approve
              </Button>
            )}
            {selectedReview?.is_approved && (
              <Button variant="outline" onClick={() => handleReject(selectedReview!)}>
                Reject
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedReview!)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
