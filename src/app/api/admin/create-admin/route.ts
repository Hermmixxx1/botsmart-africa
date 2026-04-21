import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Secret key to prevent unauthorized admin creation
const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY || 'botsmart-admin-2024';

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 
              process.env.COZE_SUPABASE_URL ||
              process.env.SUPABASE_URL;
  
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.SERVICE_ROLE_KEY;

  return { url, serviceKey };
}

// POST /api/admin/create-admin - Create an admin user
export async function POST(request: Request) {
  try {
    const { email, secretKey } = await request.json();

    // Verify secret key
    if (secretKey !== ADMIN_CREATION_KEY) {
      return NextResponse.json({ error: 'Invalid secret key' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { url, serviceKey } = getSupabaseCredentials();

    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Use service role key to bypass RLS
    const supabase = createClient(url, serviceKey);

    // First, find the user by email
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found. Please sign up first.' }, { status: 404 });
    }

    const userId = userData.id;

    // Check if already an admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingAdmin) {
      return NextResponse.json({ error: 'User is already an admin' }, { status: 400 });
    }

    // Find the super_admin role
    const { data: roleData } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', 'super_admin')
      .single();

    if (!roleData) {
      return NextResponse.json({ error: 'Super admin role not found. Please run the seed script first.' }, { status: 500 });
    }

    // Create admin user with super_admin role
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role_id: roleData.id,
        is_active: true,
      });

    if (insertError) {
      console.error('Failed to create admin:', insertError);
      return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${email} is now a super admin!` });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
