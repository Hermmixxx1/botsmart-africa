import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

// GET /api/settings - Get public site settings
export async function GET() {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('site_settings')
      .select(`
        store_name,
        logo_url,
        favicon_url,
        primary_color,
        secondary_color,
        accent_color,
        font_family,
        contact_email,
        contact_phone,
        social_media,
        shipping_policy,
        return_policy,
        privacy_policy,
        terms_of_service
      `)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    return NextResponse.json({ settings: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
