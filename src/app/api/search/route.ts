import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// GET - Search products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const sort = searchParams.get("sort") || "relevance";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const supabase = getSupabaseClient();

    // Build the query
    let dbQuery = supabase
      .from("products")
      .select(`
        *,
        categories (id, name, slug),
        seller_profiles (id, business_name)
      `)
      .eq("is_active", true);

    // Text search
    if (query) {
      dbQuery = dbQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Category filter
    if (category) {
      dbQuery = dbQuery.eq("categories.slug", category);
    }

    // Price range
    if (minPrice) {
      dbQuery = dbQuery.gte("price", minPrice);
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte("price", maxPrice);
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        dbQuery = dbQuery.order("price", { ascending: true });
        break;
      case "price_desc":
        dbQuery = dbQuery.order("price", { ascending: false });
        break;
      case "newest":
        dbQuery = dbQuery.order("created_at", { ascending: false });
        break;
      case "name_asc":
        dbQuery = dbQuery.order("name", { ascending: true });
        break;
      default:
        // relevance - no specific order
        break;
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    dbQuery = dbQuery.range(from, to);

    const { data: products, error, count } = await dbQuery;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get categories for filter options
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

    // Get price range
    const { data: priceRange } = await supabase
      .from("products")
      .select("price")
      .eq("is_active", true)
      .order("price");

    const min = priceRange && priceRange.length > 0 
      ? Math.floor(Math.min(...priceRange.map((p: { price: string }) => parseFloat(p.price))))
      : 0;
    const max = priceRange && priceRange.length > 0 
      ? Math.ceil(Math.max(...priceRange.map((p: { price: string }) => parseFloat(p.price))))
      : 1000;

    return NextResponse.json({
      products: products || [],
      categories: categories || [],
      filters: {
        min_price: min,
        max_price: max,
      },
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
