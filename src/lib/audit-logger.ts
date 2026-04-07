import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AuditLog {
  id?: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  ip_address: string;
  user_agent: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  FAILED_LOGIN = 'failed_login',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',

  // Admin actions
  ADMIN_LOGIN = 'admin_login',
  ADMIN_LOGOUT = 'admin_logout',
  ADMIN_SETTINGS_UPDATE = 'admin_settings_update',
  ADMIN_ROLE_UPDATE = 'admin_role_update',
  ADMIN_CREATE = 'admin_create',
  ADMIN_DELETE = 'admin_delete',

  // Page actions
  PAGE_CREATE = 'page_create',
  PAGE_UPDATE = 'page_update',
  PAGE_DELETE = 'page_delete',
  PAGE_PUBLISH = 'page_publish',
  PAGE_UNPUBLISH = 'page_unpublish',

  // Seller actions
  SELLER_REGISTER = 'seller_register',
  SELLER_APPROVE = 'seller_approve',
  SELLER_REJECT = 'seller_reject',
  SELLER_SUSPEND = 'seller_suspend',

  // Product actions
  PRODUCT_CREATE = 'product_create',
  PRODUCT_UPDATE = 'product_update',
  PRODUCT_DELETE = 'product_delete',
  PRODUCT_PUBLISH = 'product_publish',
  PRODUCT_UNPUBLISH = 'product_unpublish',

  // Order actions
  ORDER_CREATE = 'order_create',
  ORDER_UPDATE = 'order_update',
  ORDER_CANCEL = 'order_cancel',
  ORDER_REFUND = 'order_refund',

  // Sensitive actions
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  BULK_DELETE = 'bulk_delete',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
}

export enum EntityType {
  USER = 'user',
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  ORDER = 'order',
  PAGE = 'page',
  SETTINGS = 'settings',
  ROLE = 'role',
}

/**
 * Audit Logger class
 */
export class AuditLogger {
  /**
   * Create audit log entry
   */
  static async log(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    try {
      const client = getSupabaseClient();

      const { error } = await client
        .from('audit_logs')
        .insert({
          ...log,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to create audit log:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  /**
   * Log user login
   */
  static async logLogin(userId: string, request: Request): Promise<void> {
    await this.log({
      user_id: userId,
      action: AuditAction.LOGIN,
      entity_type: EntityType.USER,
      ip_address: this.getIPAddress(request),
      user_agent: this.getUserAgent(request),
    });
  }

  /**
   * Log failed login attempt
   */
  static async logFailedLogin(email: string, request: Request, reason?: string): Promise<void> {
    await this.log({
      user_id: email, // Use email as user_id for failed attempts
      action: AuditAction.FAILED_LOGIN,
      entity_type: EntityType.USER,
      ip_address: this.getIPAddress(request),
      user_agent: this.getUserAgent(request),
      metadata: { email, reason },
    });
  }

  /**
   * Log admin action
   */
  static async logAdminAction(
    userId: string,
    action: AuditAction,
    entityType: EntityType,
    entityId?: string,
    metadata?: Record<string, unknown>,
    request?: Request
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: request ? this.getIPAddress(request) : 'unknown',
      user_agent: request ? this.getUserAgent(request) : 'unknown',
      metadata,
    });
  }

  /**
   * Log page action
   */
  static async logPageAction(
    userId: string,
    action: AuditAction,
    pageId: string,
    request?: Request
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: EntityType.PAGE,
      entity_id: pageId,
      ip_address: request ? this.getIPAddress(request) : 'unknown',
      user_agent: request ? this.getUserAgent(request) : 'unknown',
    });
  }

  /**
   * Log seller action
   */
  static async logSellerAction(
    userId: string,
    action: AuditAction,
    sellerId: string,
    metadata?: Record<string, unknown>,
    request?: Request
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: EntityType.SELLER,
      entity_id: sellerId,
      ip_address: request ? this.getIPAddress(request) : 'unknown',
      user_agent: request ? this.getUserAgent(request) : 'unknown',
      metadata,
    });
  }

  /**
   * Get audit logs for a user
   */
  static async getUserLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      const client = getSupabaseClient();

      const { data, error } = await client
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs for an entity
   */
  static async getEntityLogs(
    entityType: EntityType,
    entityId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    try {
      const client = getSupabaseClient();

      const { data, error } = await client
        .from('audit_logs')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch entity logs:', error);
      return [];
    }
  }

  /**
   * Get all audit logs (admin only)
   */
  static async getAllLogs(filters?: {
    user_id?: string;
    action?: AuditAction;
    entity_type?: EntityType;
    start_date?: string;
    end_date?: string;
  }, limit: number = 100): Promise<AuditLog[]> {
    try {
      const client = getSupabaseClient();

      let query = client
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch all audit logs:', error);
      return [];
    }
  }

  /**
   * Extract IP address from request
   */
  private static getIPAddress(request: Request): string {
    const headers = Object.fromEntries(request.headers.entries());
    return headers['x-forwarded-for'] ||
           headers['x-real-ip'] ||
           headers['cf-connecting-ip'] ||
           'unknown';
  }

  /**
   * Extract user agent from request
   */
  private static getUserAgent(request: Request): string {
    const headers = Object.fromEntries(request.headers.entries());
    return headers['user-agent'] || 'unknown';
  }
}

/**
 * Security event monitoring
 */
export class SecurityMonitor {
  /**
   * Check for suspicious activity patterns
   */
  static async checkSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      const logs = await AuditLogger.getUserLogs(userId, 20);

      // Check for multiple failed login attempts
      const failedLogins = logs.filter(
        log => log.action === AuditAction.FAILED_LOGIN
      );

      if (failedLogins.length >= 5) {
        return true;
      }

      // Check for privilege escalation attempts
      const escalationAttempts = logs.filter(
        log => log.action === AuditAction.PRIVILEGE_ESCALATION
      );

      if (escalationAttempts.length >= 3) {
        return true;
      }

      // Check for bulk operations in short time
      const bulkOperations = logs.filter(
        log =>
          log.action === AuditAction.BULK_DELETE ||
          log.action === AuditAction.DATA_EXPORT
      );

      if (bulkOperations.length >= 5) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  }

  /**
   * Get security statistics
   */
  static async getSecurityStats(): Promise<{
    totalLogs: number;
    failedLogins: number;
    adminActions: number;
    suspiciousActivity: number;
  }> {
    try {
      const logs = await AuditLogger.getAllLogs({}, 1000);

      return {
        totalLogs: logs.length,
        failedLogins: logs.filter(log => log.action === AuditAction.FAILED_LOGIN).length,
        adminActions: logs.filter(log => log.action.startsWith('admin_')).length,
        suspiciousActivity: logs.filter(log =>
          log.action === AuditAction.PRIVILEGE_ESCALATION ||
          log.action === AuditAction.BULK_DELETE
        ).length,
      };
    } catch (error) {
      console.error('Error getting security stats:', error);
      return {
        totalLogs: 0,
        failedLogins: 0,
        adminActions: 0,
        suspiciousActivity: 0,
      };
    }
  }
}
