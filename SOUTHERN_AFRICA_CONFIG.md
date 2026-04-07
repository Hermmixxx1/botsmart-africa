# The Lebogang Group - Southern African E-Commerce Platform

## Overview

A production-ready, secure multi-vendor e-commerce platform designed for **The Lebogang Group**, specifically targeting **Southern Africa**.

## Regional Configuration

### Supported Countries (Middle to Southern Africa)

The platform supports the following 12 countries in the Southern African region:

1. **South Africa (ZA)** 🇿🇦
   - Currency: ZAR (South African Rand) - R
   - Languages: English, Afrikaans, Zulu, Xhosa, Sesotho, Tswana, Tsonga
   - Phone: +27

2. **Namibia (NA)** 🇳🇦
   - Currency: NAD (Namibian Dollar) - N$
   - Languages: English, Afrikaans, German, Oshiwambo, Khoekhoe
   - Phone: +264

3. **Botswana (BW)** 🇧🇼
   - Currency: BWP (Botswana Pula) - P
   - Languages: English, Tswana
   - Phone: +267

4. **Zimbabwe (ZW)** 🇿🇼
   - Currency: ZWL (Zimbabwean Dollar) - $
   - Languages: English, Shona, Ndebele
   - Phone: +263

5. **Mozambique (MZ)** 🇲🇿
   - Currency: MZN (Mozambican Metical) - MT
   - Languages: Portuguese, Makhuwa, Tsonga
   - Phone: +258

6. **Lesotho (LS)** 🇱🇸
   - Currency: LSL (Lesotho Loti) - L
   - Languages: English, Sesotho
   - Phone: +266

7. **Eswatini (SZ)** 🇸🇿
   - Currency: SZL (Swazi Lilangeni) - E
   - Languages: English, Swazi
   - Phone: +268

8. **Angola (AO)** 🇦🇴
   - Currency: AOA (Angolan Kwanza) - Kz
   - Languages: Portuguese, Umbundu, Kimbundu
   - Phone: +244

9. **Zambia (ZM)** 🇿🇲
   - Currency: ZMW (Zambian Kwacha) - ZK
   - Languages: English, Nyanja, Bemba, Lozi
   - Phone: +260

10. **Malawi (MW)** 🇲🇼
    - Currency: MWK (Malawian Kwacha) - MK
    - Languages: English, Chichewa
    - Phone: +265

11. **Madagascar (MG)** 🇲🇬
    - Currency: MGA (Malagasy Ariary) - Ar
    - Languages: Malagasy, French
    - Phone: +261

12. **Tanzania (TZ)** 🇹🇿
    - Currency: TZS (Tanzanian Shilling) - TSh
    - Languages: Swahili, English, Arabic
    - Phone: +255

### Supported Languages

The platform supports 15 languages commonly spoken in Southern Africa:

1. **English** (Official in most countries)
2. **Portuguese** (Angola, Mozambique)
3. **French** (Madagascar)
4. **Afrikaans** (South Africa, Namibia)
5. **Zulu** (isiZulu - South Africa)
6. **Xhosa** (isiXhosa - South Africa)
7. **Sesotho** (Lesotho, South Africa)
8. **Tswana** (Setswana - Botswana, South Africa)
9. **Shona** (chiShona - Zimbabwe)
10. **Ndebele** (isiNdebele - Zimbabwe, South Africa)
11. **Swahili** (Kiswahili - Tanzania, Zambia, Mozambique)
12. **Chichewa** (Chinyanja - Malawi, Zambia, Mozambique)
13. **Arabic** (العربية - Tanzania, parts of the region)
14. **Tsonga** (Xitsonga - South Africa, Mozambique, Zimbabwe, Eswatini)
15. **German** (Deutsch - Namibia)

### Currency Support

All 12 local currencies are supported with automatic conversion:
- **Base Currency**: ZAR (South African Rand)
- **Real-time Conversion**: Support for all supported currencies
- **Pegged Currencies**: NAD, LSL, SZL are pegged to ZAR (1:1)

## Security Features

### 1. Rate Limiting
- **API Protection**: 100 requests per 15 minutes per IP
- **Customizable**: Different limits for different endpoints
- **Automatic**: Middleware-based implementation
- **Storage**: In-memory (production: Redis recommended)

### 2. CSRF Protection
- **Token-based**: Secure token generation and validation
- **HMAC Signature**: Cryptographic verification
- **Expiration**: 1-hour token validity
- **Multi-endpoint**: Works with all protected routes

### 3. XSS Prevention
- **Input Sanitization**: Automatic HTML sanitization
- **Output Encoding**: Safe HTML entity escaping
- **URL Validation**: Prevents malicious URL injection
- **Content Security Policy**: Strict CSP headers

### 4. Input Validation
- **Email Validation**: Proper email format checking
- **Phone Validation**: Country-specific phone number formats
- **Password Strength**: Enforces strong passwords (8+ chars, mixed case, numbers, symbols)
- **SQL Injection Protection**: Parameterized queries via Supabase

### 5. Security Headers
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: max-age=31536000
- **Content-Security-Policy**: Strict CSP for XSS prevention
- **Referrer-Policy**: strict-origin-when-cross-origin

### 6. Audit Logging
- **Comprehensive Tracking**: All user and admin actions logged
- **Action Types**: Login, CRUD operations, sensitive actions
- **Metadata**: IP address, user agent, timestamps
- **Searchable**: Filter by user, action, entity, date range
- **Security Monitoring**: Detects suspicious activity patterns

### 7. IP Whitelisting (Optional)
- **Admin Protection**: Restrict admin access to specific IPs
- **Configurable**: Set allowed IPs via environment variables
- **Flexible**: Can be enabled/disabled per environment

## Business Configuration

### Company Details
- **Name**: The Lebogang Group
- **Tagline**: Your Trusted E-Commerce Partner in Southern Africa
- **Default Country**: South Africa (ZA)
- **Default Currency**: ZAR (South African Rand)
- **Default Language**: English (en-ZA)

### Contact Information
- **Email**: info@leboganggroup.co.za
- **Phone**: +27 11 123 4567
- **Address**: Johannesburg, South Africa

### Social Media
- **Facebook**: https://facebook.com/leboganggroup
- **Twitter**: https://twitter.com/leboganggroup
- **LinkedIn**: https://linkedin.com/company/leboganggroup
- **Instagram**: https://instagram.com/leboganggroup

## Platform Features

### Multi-Vendor System
- Individual and Business seller types
- Admin approval workflow
- Automatic payout calculation (90% seller, 10% platform)
- Multi-currency support

### Role-Based Access Control (RBAC)
- **Super Admin**: Full system control
- **Admin**: Products, orders, customers management
- **Manager**: Read-only access to products and orders

### CMS (Content Management System)
- Create, edit, delete pages
- HTML content support
- SEO optimization
- Publishing workflow

### Site Settings
- Store branding (logo, colors, fonts)
- Contact information
- Social media links
- Platform fee configuration
- Policy documents (shipping, return, privacy, terms)

## Configuration Files

### Regional Configuration
`src/lib/region-config.ts`
- Country definitions
- Currency codes and symbols
- Language support
- Exchange rates
- Helper functions for currency conversion

### Security Utilities
`src/lib/security.ts`
- Rate limiting
- CSRF protection
- XSS prevention
- Input sanitization
- Security headers
- IP whitelisting

### Audit Logging
`src/lib/audit-logger.ts`
- Audit log creation
- User activity tracking
- Security monitoring
- Suspicious activity detection

### Database Schema
`src/storage/database/shared/schema.ts`
- Tables for all features
- Indexes for performance
- Type definitions
- Zod validation schemas

## API Endpoints

### Public Endpoints
- `GET /api/settings` - Get site settings
- `GET /api/pages/[slug]` - Get published page
- `GET /api/countries` - Get supported countries
- `GET /api/currencies` - Get supported currencies
- `GET /api/languages` - Get supported languages

### User Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/cart` - Get cart items
- `POST /api/orders` - Create order

### Seller Endpoints
- `POST /api/sellers` - Register as seller
- `GET /api/sellers` - Get seller profile
- `GET /api/seller/products` - Get seller products
- `GET /api/seller/orders` - Get seller orders

### Admin Endpoints (Protected)
- `GET/PATCH /api/admin/settings` - Site settings
- `GET/POST /api/admin/pages` - Page management
- `GET/PATCH/DELETE /api/admin/pages/[id]` - Single page
- `GET/POST /api/admin/admins` - Admin management
- `GET/PATCH/DELETE /api/admin/admins/[id]` - Single admin
- `GET/POST /api/admin/roles` - Role management

## Security Best Practices

### For Users
1. Use strong passwords (8+ characters, mixed case, numbers, symbols)
2. Enable two-factor authentication when available
3. Don't share your credentials
4. Monitor your account activity

### For Sellers
1. Verify your business information
2. Use secure banking details
3. Monitor your payouts and earnings
4. Keep your seller profile updated

### For Admins
1. Use IP whitelisting for admin access
2. Regularly review audit logs
3. Monitor for suspicious activity
4. Keep software updated

## Deployment

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security
CSRF_SECRET=your_csrf_secret
ADMIN_ALLOWED_IPS=ip1,ip2,ip3

# Site Configuration
NEXT_PUBLIC_SITE_NAME=The Lebogang Group
NEXT_PUBLIC_DEFAULT_COUNTRY=ZA
NEXT_PUBLIC_DEFAULT_CURRENCY=ZAR
```

### Database Migration
Run the SQL scripts in order:
1. `schema.ts` - Create tables
2. Regional migration - Add supported countries/currencies/languages
3. Audit logs migration - Create security tracking tables

## Support

For technical support or questions:
- **Email**: info@leboganggroup.co.za
- **Phone**: +27 11 123 4567
- **Documentation**: See AGENTS.md for detailed technical documentation

## License

Proprietary - The Lebogang Group © 2026
