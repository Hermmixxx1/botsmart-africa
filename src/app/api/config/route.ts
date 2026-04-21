import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/config - Get public configuration for client-side
export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.COZE_SUPABASE_URL || '',
    supabaseAnonKey: process.env.COZE_SUPABASE_ANON_KEY || '',
    siteUrl: process.env.COZE_PROJECT_DOMAIN_DEFAULT || '',
  });
}
