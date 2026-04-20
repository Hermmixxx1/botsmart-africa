import { NextRequest, NextResponse } from "next/server";
import { FetchClient, Config, LLMClient, HeaderUtils } from "coze-coding-dev-sdk";
import { requireSuperAdmin } from "@/lib/rbac";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { z } from "zod";
import crypto from "crypto";

const importSchema = z.object({
  url: z.string().url("Invalid URL"),
  category_id: z.string().optional(),
  markup_percentage: z.number().min(0).max(100).default(15),
});

interface ExtractedProduct {
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Check super admin authorization
    const authResult = await requireSuperAdmin(request);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, category_id, markup_percentage } = importSchema.parse(body);

    // Initialize SDK clients
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // Step 1: Fetch URL content
    const fetchClient = new FetchClient(config, customHeaders);
    const fetchResponse = await fetchClient.fetch(url);

    if (fetchResponse.status_code !== 0) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${fetchResponse.status_message}` },
        { status: 400 }
      );
    }

    // Extract text content from fetch response
    const textContent = fetchResponse.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\n")
      .substring(0, 15000); // Limit content size

    // Extract images
    const images = fetchResponse.content
      .filter((item) => item.type === "image")
      .map((item) => item.image?.display_url || item.image?.image_url)
      .filter((url): url is string => !!url);

    // Step 2: Use LLM to extract product information
    const llmClient = new LLMClient(config, customHeaders);

    const extractionPrompt = `You are an expert e-commerce product analyzer. Analyze the following webpage content and extract structured product information.

Extract the following fields:
- name: Product name/title (be specific and descriptive)
- description: Detailed product description (at least 2-3 sentences)
- price: The product price as a number (only the numeric value, no currency symbols)
- image_url: The main/best product image URL (prefer high-resolution images)

IMPORTANT:
- Only extract REAL product information from the content
- Price must be a number only (e.g., 99.99, not "$99.99")
- If price is not found, set price to 0
- If name is not found, set name to "Imported Product"
- If description is not found, set description to "No description available"
- Return ONLY valid JSON, no markdown or explanations

Webpage Title: ${fetchResponse.title || "Unknown"}
Content to analyze:
${textContent}`;

    const llmResponse = await llmClient.invoke(
      [
        {
          role: "user",
          content: extractionPrompt,
        },
      ],
      {
        model: "doubao-seed-2-0-lite-260215",
        temperature: 0.3,
      }
    );

    // Parse LLM response
    let extractedProduct: ExtractedProduct;
    try {
      // Try to extract JSON from the response
      const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      extractedProduct = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse LLM response:", llmResponse.content);
      return NextResponse.json(
        { error: "Failed to extract product information from the page" },
        { status: 422 }
      );
    }

    // Step 3: Apply markup
    const originalPrice = extractedProduct.price || 0;
    const markup = markup_percentage / 100;
    const finalPrice = originalPrice * (1 + markup);
    const comparePrice = originalPrice > 0 ? originalPrice : null;

    // Step 4: Generate slug
    const slugBase = extractedProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100);
    const slug = `${slugBase}-${crypto.randomUUID().substring(0, 8)}`;

    // Step 5: Save to database
    const supabase = getSupabaseClient();

    const { data: product, error: dbError } = await supabase
      .from("products")
      .insert({
        name: extractedProduct.name,
        slug: slug,
        description: extractedProduct.description,
        price: finalPrice.toFixed(2),
        compare_price: comparePrice?.toFixed(2) || null,
        image_url: extractedProduct.image_url || images[0] || "",
        images: images.length > 0 ? images : [],
        category_id: category_id || null,
        seller_id: null, // Admin imported products have no seller
        stock: 100, // Default stock
        is_active: true,
        is_featured: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save product to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        original_price: originalPrice,
        compare_price: comparePrice,
        markup_applied: markup_percentage,
        image_url: product.image_url,
        source_url: url,
      },
      message: `Product imported successfully with ${markup_percentage}% markup`,
    });
  } catch (error) {
    console.error("Import error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to import product" },
      { status: 500 }
    );
  }
}
