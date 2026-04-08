import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserPermissions } from '@/lib/rbac';

// GET /api/auth/check-admin - Check if current user is an admin
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 });
    }

    const permissions = await getUserPermissions(user.id);

    if (!permissions || !permissions.isAdmin) {
      return NextResponse.json({ isAdmin: false, error: 'Not an admin' }, { status: 403 });
    }

    return NextResponse.json({
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
      },
      permissions,
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ isAdmin: false, error: 'Server error' }, { status: 500 });
  }
}
