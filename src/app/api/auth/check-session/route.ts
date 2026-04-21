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

// GET /api/auth/check-session - Get current session info
export async function GET() {
  try {
    const { url, anonKey } = getSupabaseCredentials();

    if (!url || !anonKey) {
      return NextResponse.json({ user: null });
    }

    const supabase = createClient(url, anonKey);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Check session error:', error);
    return NextResponse.json({ user: null });
  }
}
