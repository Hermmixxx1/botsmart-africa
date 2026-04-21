import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { requireSuperAdmin } from "@/lib/rbac";
import { getSupabase } from "@/storage/database/supabase-client";
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

    // Step 1: Fetch URL content using native fetch
    let htmlContent = "";
    let title = "";
    let images: string[] = [];

    try {
      const fetchResponse = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
      });

      if (!fetchResponse.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${fetchResponse.status} ${fetchResponse.statusText}` },
          { status: 400 }
        );
      }

      htmlContent = await fetchResponse.text();

      // Extract title
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : "Unknown";

      // Extract meta description
      const metaDescMatch = htmlContent.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
        htmlContent.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
      const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : "";

      // Extract main image (og:image)
      const ogImageMatch = htmlContent.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        htmlContent.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      const ogImage = ogImageMatch ? ogImageMatch[1] : "";

      // Extract additional images from img tags
      const imgMatches = htmlContent.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
      const imgUrls: string[] = [];
      for (const match of imgMatches) {
        const imgUrl = match[1];
        // Filter out small icons and tracking pixels
        if (imgUrl && !imgUrl.includes("icon") && !imgUrl.includes("pixel") && imgUrl.startsWith("http")) {
          imgUrls.push(imgUrl);
        }
      }

      // Deduplicate and prioritize
      images = [...new Set([ogImage, ...imgUrls])].filter(Boolean);

    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch the product URL" },
        { status: 400 }
      );
    }

    // Step 2: Use LLM to extract product information
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const extractionPrompt = `You are an expert e-commerce product analyzer. Analyze the following webpage content and extract structured product information.

Extract the following fields:
- name: Product name/title (be specific and descriptive, 5-100 characters)
- description: Detailed product description (at least 2-3 sentences, extract from the content)
- price: The product price as a number only (e.g., 99.99, not "$99.99" or "R99.99")
- image_url: The main product image URL (prefer the first/highest quality image from the provided images list)

Provided Images (in order of priority):
${images.slice(0, 10).map((img, i) => `${i + 1}. ${img}`).join("\n")}

IMPORTANT RULES:
- price MUST be a number only (no currency symbols, no "R", no commas)
- If price is not found in the content, set price to 0
- If name is not found, set name to "Imported Product"
- If description is not found, use this fallback: "Quality product imported from external source."
- For image_url, use the first valid image URL from the list above, or any product image you find
- Return ONLY valid JSON object with these exact fields: name, description, price, image_url
- Do NOT include any markdown, explanations, or additional text

Webpage Title: ${title}
Content to analyze (first 8000 chars):
${htmlContent.substring(0, 8000)}`;

    let extractedProduct: ExtractedProduct;

    try {
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
      try {
        const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in LLM response");
        }
        extractedProduct = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!extractedProduct.name) extractedProduct.name = "Imported Product";
        if (!extractedProduct.price || isNaN(extractedProduct.price)) extractedProduct.price = 0;
        if (!extractedProduct.description) extractedProduct.description = "Quality product imported from external source.";
        if (!extractedProduct.image_url && images.length > 0) {
          extractedProduct.image_url = images[0];
        }

      } catch (parseError) {
        console.error("Failed to parse LLM response:", llmResponse.content);
        return NextResponse.json(
          { error: "Failed to extract product information from the page. Please try a different URL." },
          { status: 422 }
        );
      }

    } catch (llmError: any) {
      console.error("LLM error:", llmError);
      return NextResponse.json(
        { error: `AI extraction failed: ${llmError.message || "Please try again"}` },
        { status: 500 }
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
    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: product, error: dbError } = await supabase
      .from("products")
      .insert({
        name: extractedProduct.name,
        slug: slug,
        description: extractedProduct.description,
        price: finalPrice.toFixed(2),
        compare_price: comparePrice?.toFixed(2) || null,
        image_url: extractedProduct.image_url || "",
        images: images.length > 0 ? images.slice(0, 10) : [],
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
