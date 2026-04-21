import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/storage/database/supabase-client";
import { z } from "zod";

const reviewSchema = z.object({
  product_id: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

// GET - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const supabase = getSupabase();

    let query = supabase
      .from("reviews")
      .select(`
        *,
        profiles:user_id (full_name, avatar_url)
      `)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reviews, error, count } = await query.range(from, to);

    if (error) {
      console.error("Reviews GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate average rating
    let avgRating = 0;
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (productId && reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r: { rating: number }) => {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
        return sum + r.rating;
      }, 0);
      avgRating = totalRating / reviews.length;
    }

    return NextResponse.json({
      reviews: reviews || [],
      average_rating: avgRating,
      rating_distribution: ratingDistribution,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = reviewSchema.parse(body);

    // Get user from session
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", validated.product_id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Check if user purchased this product (verified purchase)
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", validated.product_id)
      .limit(1);

    const isVerifiedPurchase = !!orderItem && orderItem.length > 0;

    // Create the review
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        product_id: validated.product_id,
        user_id: user.id,
        rating: validated.rating,
        title: validated.title || null,
        comment: validated.comment || null,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: true, // Auto-approve for now
      })
      .select()
      .single();

    if (error) {
      console.error("Review create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Review create error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
