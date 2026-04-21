import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 
              process.env.COZE_SUPABASE_URL ||
              process.env.SUPABASE_URL;
  
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                  process.env.COZE_SUPABASE_ANON_KEY ||
                  process.env.SUPABASE_ANON_KEY;

  return { url, anonKey };
}

// GET /api/profile - Get user profile
export async function GET() {
  try {
    const { url, anonKey } = getSupabaseCredentials();

    if (!url || !anonKey) {
      return NextResponse.json({ profile: null });
    }

    const supabase = createClient(url, anonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ profile: null, error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ profile: null });
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: Request) {
  try {
    const { url, anonKey } = getSupabaseCredentials();

    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(url, anonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone } = body;

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: full_name || user.user_metadata?.full_name,
        phone: phone || '',
      },
    });

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
