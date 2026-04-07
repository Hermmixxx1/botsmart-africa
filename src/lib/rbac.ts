import { getSupabaseClient } from '@/storage/database/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'customer' | 'seller';

export interface UserPermissions {
  role: UserRole;
  permissions: string[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export const PERMISSIONS = {
  // All access
  ALL: '*',

  // Products
  PRODUCTS_READ: 'products.read',
  PRODUCTS_WRITE: 'products.write',
  PRODUCTS_DELETE: 'products.delete',

  // Orders
  ORDERS_READ: 'orders.read',
  ORDERS_WRITE: 'orders.write',
  ORDERS_DELETE: 'orders.delete',

  // Customers
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_WRITE: 'customers.write',
  CUSTOMERS_DELETE: 'customers.delete',

  // Sellers
  SELLERS_READ: 'sellers.read',
  SELLERS_WRITE: 'sellers.write',
  SELLERS_DELETE: 'sellers.delete',
  SELLERS_APPROVE: 'sellers.approve',

  // Admins
  ADMINS_READ: 'admins.read',
  ADMINS_WRITE: 'admins.write',
  ADMINS_DELETE: 'admins.delete',

  // Pages
  PAGES_READ: 'pages.read',
  PAGES_WRITE: 'pages.write',
  PAGES_DELETE: 'pages.delete',

  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',

  // Categories
  CATEGORIES_READ: 'categories.read',
  CATEGORIES_WRITE: 'categories.write',
  CATEGORIES_DELETE: 'categories.delete',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  admin: [
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_WRITE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_WRITE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.SELLERS_READ,
    PERMISSIONS.SELLERS_WRITE,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_WRITE,
    PERMISSIONS.PAGES_READ,
    PERMISSIONS.PAGES_WRITE,
  ],
  manager: [
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_WRITE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.CATEGORIES_READ,
  ],
  customer: [],
  seller: [],
};

/**
 * Get user role and permissions from database
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  try {
    const client = getSupabaseClient();

    // Check if user is an admin
    const { data: adminData, error: adminError } = await client
      .from('admin_users')
      .select(`
        role_id,
        is_active,
        admin_roles (
          name,
          permissions
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (adminError) {
      console.error('Error fetching admin permissions:', adminError);
      return null;
    }

    // If user is an admin
    if (adminData && adminData.is_active && adminData.admin_roles) {
      const roleName = adminData.admin_roles.name as UserRole;
      const permissions = adminData.admin_roles.permissions as string[];

      return {
        role: roleName,
        permissions,
        isAdmin: true,
        isSuperAdmin: roleName === 'super_admin',
      };
    }

    // Check if user is a seller
    const { data: sellerData } = await client
      .from('seller_profiles')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle();

    if (sellerData) {
      return {
        role: 'seller',
        permissions: [],
        isAdmin: false,
        isSuperAdmin: false,
      };
    }

    // Default to customer
    return {
      role: 'customer',
      permissions: [],
      isAdmin: false,
      isSuperAdmin: false,
    };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(userPermissions: UserPermissions, permission: string): boolean {
  if (userPermissions.isSuperAdmin) return true;
  if (userPermissions.permissions.includes(PERMISSIONS.ALL)) return true;
  return userPermissions.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userPermissions: UserPermissions, permissions: string[]): boolean {
  if (userPermissions.isSuperAdmin) return true;
  if (userPermissions.permissions.includes(PERMISSIONS.ALL)) return true;
  return permissions.some(p => userPermissions.permissions.includes(p));
}

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string } | null> {
  const client = getSupabaseClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return null;
  }

  return { userId: user.id };
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(request: NextRequest): Promise<{ userId: string; permissions: UserPermissions } | null> {
  const auth = await requireAuth(request);
  if (!auth) return null;

  const permissions = await getUserPermissions(auth.userId);
  if (!permissions || !permissions.isAdmin) {
    return null;
  }

  return { userId: auth.userId, permissions };
}

/**
 * Middleware to check if user is super admin
 */
export async function requireSuperAdmin(request: NextRequest): Promise<{ userId: string; permissions: UserPermissions } | null> {
  const auth = await requireAuth(request);
  if (!auth) return null;

  const permissions = await getUserPermissions(auth.userId);
  if (!permissions || !permissions.isSuperAdmin) {
    return null;
  }

  return { userId: auth.userId, permissions };
}

/**
 * Middleware to check specific permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: string
): Promise<{ userId: string; permissions: UserPermissions } | null> {
  const auth = await requireAuth(request);
  if (!auth) return null;

  const permissions = await getUserPermissions(auth.userId);
  if (!permissions) return null;

  if (!hasPermission(permissions, permission)) {
    return null;
  }

  return { userId: auth.userId, permissions };
}

/**
 * Create NextResponse for unauthorized access
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create NextResponse for forbidden access
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}
