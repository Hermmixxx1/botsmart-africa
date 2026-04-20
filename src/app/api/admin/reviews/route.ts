import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { requireAdmin } from "@/lib/rbac";

// GET - Get all reviews (admin)
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // 'approved', 'pending', 'all'
    const productId = searchParams.get("product_id");

    const supabase = getSupabaseClient();

    let query = supabase
      .from("reviews")
      .select(`
        *,
        products (id, name, slug)
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    // Filter by approval status
    if (status === "pending") {
      query = query.eq("is_approved", false);
    } else if (status === "approved") {
      query = query.eq("is_approved", true);
    }

    // Filter by product
    if (productId) {
      query = query.eq("product_id", productId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error("Admin reviews GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user info for each review
    const userIds = reviews?.map((r: { user_id: string }) => r.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const reviewsWithUsers = reviews?.map((review: { user_id: string }) => {
      const profile = profiles?.find((p: { id: string }) => p.id === review.user_id);
      return {
        ...review,
        user: profile,
      };
    });

    return NextResponse.json({
      reviews: reviewsWithUsers || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
