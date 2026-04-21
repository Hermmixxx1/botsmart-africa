import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/storage/database/supabase-client";

// POST - Request password reset email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://botsmart-africa-krdn5eesh-hermix-lebogangs-projects.vercel.app'}/auth/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Password reset email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
