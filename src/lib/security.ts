import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  message?: string;      // Custom error message
}

/**
 * Rate limiting middleware
 * Prevents API abuse and DDoS attacks
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest, identifier?: string): Promise<boolean> => {
    const key = identifier || getClientIdentifier(request);
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (record.count >= config.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);
    return true;
  };
}

/**
 * Get client identifier for rate limiting
 * Uses IP address (in production, consider user ID for authenticated users)
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = request.headers.get('cf-connecting-ip');

  return ip || realIP || forwarded || request.ip || 'unknown';
}

/**
 * CSRF Token generation and validation
 */
export class CSRFProtection {
  private static readonly SECRET = process.env.CSRF_SECRET || 'default-secret-change-in-production';
  private static readonly HEADER_NAME = 'x-csrf-token';

  /**
   * Generate CSRF token
   */
  static generateToken(userId: string): string {
    const timestamp = Date.now();
    const data = `${userId}:${timestamp}`;
    const signature = Buffer.from(this.hmac(data)).toString('base64');
    return `${Buffer.from(data).toString('base64')}.${signature}`;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token: string, userId: string): boolean {
    try {
      const [data, signature] = token.split('.');
      const decodedData = Buffer.from(data, 'base64').toString();
      const [tokenUserId, timestamp] = decodedData.split(':');

      // Check if token matches user
      if (tokenUserId !== userId) {
        return false;
      }

      // Check if token is expired (1 hour)
      const tokenTime = parseInt(timestamp);
      if (Date.now() - tokenTime > 3600000) {
        return false;
      }

      // Verify signature
      const expectedSignature = Buffer.from(this.hmac(decodedData)).toString('base64');
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  /**
   * HMAC signature for CSRF tokens
   */
  private static hmac(data: string): string {
    // Simple HMAC implementation (use crypto module in production)
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.SECRET)
      .update(data)
      .digest('hex');
  }

  /**
   * Get CSRF token from request
   */
  static getTokenFromRequest(request: NextRequest): string | null {
    return request.headers.get(this.HEADER_NAME) || request.headers.get('x-xsrf-token');
  }
}

/**
 * XSS Prevention utilities
 */
export const XSSProtection = {
  /**
   * Sanitize HTML content
   */
  sanitizeHTML(input: string): string {
    // Remove potentially dangerous HTML tags and attributes
    const dangerousPatterns = [
      /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
      /<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gi,
      /<object\b[^>]*>([\s\S]*?)<\/object>/gi,
      /<embed\b[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
    ];

    let sanitized = input;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  },

  /**
   * Escape HTML entities
   */
  escapeHTML(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, char => map[char]);
  },

  /**
   * Validate URL to prevent XSS
   */
  isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      // Only allow http, https protocols
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },
};

/**
 * Input validation and sanitization
 */
export class InputSanitizer {
  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize phone number
   */
  static sanitizePhone(phone: string): string {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
  }

  /**
   * Validate phone number format (Southern African format)
   */
  static isValidPhone(phone: string, countryCode: string = 'ZA'): boolean {
    const sanitized = this.sanitizePhone(phone);

    // Validate based on country code
    const patterns: Record<string, RegExp> = {
      ZA: /^\+27\d{9}$/, // South Africa: +27 followed by 9 digits
      NA: /^\+264\d{9}$/, // Namibia: +264 followed by 9 digits
      BW: /^\+267\d{8}$/, // Botswana: +267 followed by 8 digits
      ZW: /^\+263\d{9}$/, // Zimbabwe: +263 followed by 9 digits
      MZ: /^\+258\d{9}$/, // Mozambique: +258 followed by 9 digits
      LS: /^\+266\d{8}$/, // Lesotho: +266 followed by 8 digits
      SZ: /^\+268\d{8}$/, // Eswatini: +268 followed by 8 digits
      AO: /^\+244\d{9}$/, // Angola: +244 followed by 9 digits
      ZM: /^\+260\d{9}$/, // Zambia: +260 followed by 9 digits
      MW: /^\+265\d{8}$/, // Malawi: +265 followed by 8 digits
      MG: /^\+261\d{9}$/, // Madagascar: +261 followed by 9 digits
      TZ: /^\+255\d{9}$/, // Tanzania: +255 followed by 9 digits
    };

    const pattern = patterns[countryCode] || patterns.ZA;
    return pattern.test(sanitized);
  }

  /**
   * Sanitize user input (text fields)
   */
  static sanitizeInput(input: string): string {
    return XSSProtection.escapeHTML(input.trim());
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password: string): boolean {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Get password strength rating
   */
  static getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
}

/**
 * Security headers for HTTP responses
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy':
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://api.stripe.com https://*.supabase.co; " +
      "frame-ancestors 'none';",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * IP whitelist check (for admin access)
 */
export class IPWhitelist {
  private static readonly allowedIPs: string[] = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];

  /**
   * Check if IP is whitelisted
   */
  static isAllowed(request: NextRequest): boolean {
    const ip = getClientIdentifier(request);
    return this.allowedIPs.length === 0 || this.allowedIPs.includes(ip);
  }
}
