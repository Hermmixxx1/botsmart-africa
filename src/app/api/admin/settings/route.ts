import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireSuperAdmin, PERMISSIONS } from '@/lib/rbac';

// GET /api/admin/settings - Get site settings (super admin only)
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const auth = await requireSuperAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await client
      .from('site_settings')
      .select('*')
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

// PATCH /api/admin/settings - Update site settings (super admin only)
export async function PATCH(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const auth = await requireSuperAdmin(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      store_name,
      logo_url,
      favicon_url,
      primary_color,
      secondary_color,
      font_family,
      contact_email,
      contact_phone,
      social_media,
      platform_fee_percentage,
      shipping_policy,
      return_policy,
      privacy_policy,
      terms_of_service,
    } = body;

    const updateData: Record<string, unknown> = {
      updated_by: auth.userId,
    };

    if (store_name) updateData.store_name = store_name;
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (favicon_url !== undefined) updateData.favicon_url = favicon_url;
    if (primary_color) updateData.primary_color = primary_color;
    if (secondary_color) updateData.secondary_color = secondary_color;
    if (font_family) updateData.font_family = font_family;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone;
    if (social_media !== undefined) updateData.social_media = social_media;
    if (platform_fee_percentage !== undefined) updateData.platform_fee_percentage = platform_fee_percentage;
    if (shipping_policy !== undefined) updateData.shipping_policy = shipping_policy;
    if (return_policy !== undefined) updateData.return_policy = return_policy;
    if (privacy_policy !== undefined) updateData.privacy_policy = privacy_policy;
    if (terms_of_service !== undefined) updateData.terms_of_service = terms_of_service;

    const { data, error } = await client
      .from('site_settings')
      .update(updateData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return NextResponse.json({ settings: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
