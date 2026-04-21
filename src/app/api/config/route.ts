import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/config - Get public configuration for client-side
export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY || '',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.COZE_PROJECT_DOMAIN_DEFAULT || '',
  });
}
