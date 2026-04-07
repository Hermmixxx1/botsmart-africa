# ShopHub - Production-Ready eCommerce Platform

A complete, production-ready eCommerce website built with Next.js, Supabase, and TypeScript. Features include product management, shopping cart, user authentication, order processing, and an admin panel.

## 🚀 Features

### User Side
- ✅ **Homepage** with featured products and category browsing
- ✅ **Product Listing** with category filters and search
- ✅ **Product Detail** pages with full information
- ✅ **Shopping Cart** with quantity management
- ✅ **Checkout** with address management
- ✅ **User Authentication** (sign up/sign in)
- ✅ **Order History** to view past purchases
- ✅ **Responsive Design** works on all devices

### Admin Panel
- ✅ **Dashboard** with overview statistics
- ✅ **Product Management** (view, add, edit, delete)
- ✅ **Order Management** (view, update status)
- ✅ **Category Management** (view, add, delete)

### Technical Features
- ✅ **Database** with Supabase (PostgreSQL)
- ✅ **Authentication** with Supabase Auth
- ✅ **State Management** with Zustand
- ✅ **UI Components** with shadcn/ui
- ✅ **TypeScript** for type safety
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **API Routes** for backend logic
- ⚠️ **Stripe Integration** (setup required)
- ⚠️ **Image Upload** (setup required)

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier works)
- Stripe account (optional, for payments)

## 🛠️ Setup Instructions

### 1. Environment Variables

The following environment variables are automatically configured in the Coze environment:
- `COZE_SUPABASE_URL` - Your Supabase project URL
- `COZE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `COZE_BUCKET_ENDPOINT_URL` - Object storage endpoint
- `COZE_BUCKET_NAME` - Object storage bucket name
- `COZE_PROJECT_DOMAIN_DEFAULT` - Your project domain

For Stripe (optional), add to your environment:
```bash
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
```

### 2. Database Setup

The database schema is already created and seeded with sample data. The following tables are available:

- `categories` - Product categories
- `products` - Product information
- `addresses` - User shipping addresses
- `orders` - Customer orders
- `order_items` - Items in each order
- `cart_items` - Shopping cart items

**Row Level Security (RLS)** is enabled on all tables to ensure data privacy and security.

### 3. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
pnpm install
```

### 4. Run Development Server

The development server is already running on port 5000. If you need to restart:

```bash
coze dev
```

The site will be available at: `http://localhost:5000`

### 5. Seed Database (Optional)

If you need to reseed the database with sample data:

```bash
npx tsx seed.ts
```

This will create:
- 4 categories (Electronics, Clothing, Home & Garden, Sports & Outdoors)
- 10 sample products with images

## 📦 Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── page.tsx       # Admin dashboard
│   │   ├── products/      # Product management
│   │   └── orders/        # Order management
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product CRUD
│   │   ├── cart/          # Cart operations
│   │   ├── orders/        # Order management
│   │   ├── addresses/     # Address management
│   │   └── categories/    # Category CRUD
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout page
│   ├── orders/            # Order history
│   ├── products/          # Product pages
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Homepage
├── components/
│   ├── ui/                # shadcn/ui components
│   └── Navigation.tsx     # Main navigation
├── lib/
│   ├── auth.ts            # Authentication utilities
│   └── utils.ts           # Utility functions
├── store/
│   └── useStore.ts        # Zustand state management
└── storage/database/
    ├── shared/
    │   └── schema.ts      # Database schema
    └── supabase-client.ts # Supabase client
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server

# Build
pnpm build            # Build for production

# Production
pnpm start            # Start production server

# Type checking
pnpm ts-check         # Check TypeScript types

# Linting
pnpm lint             # Run ESLint
```

## 🌐 API Endpoints

### Products
- `GET /api/products` - List all products (supports filtering)
- `POST /api/products` - Create new product (admin)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[id]` - Update cart item quantity
- `DELETE /api/cart/[id]` - Remove item from cart

### Orders
- `GET /api/orders` - List user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get single order

### Addresses
- `GET /api/addresses` - List user's addresses
- `POST /api/addresses` - Create new address

### Authentication
- `POST /api/auth/signup` - Sign up new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

## 💳 Stripe Integration (Optional)

To enable real payment processing:

1. **Create a Stripe account** at https://stripe.com
2. **Get your API keys** from the Stripe dashboard
3. **Add environment variables**:
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
   ```
4. **Create a Stripe checkout session** in `/src/app/api/checkout/route.ts`
5. **Update the checkout page** to redirect to Stripe
6. **Create a webhook** to handle payment confirmation

For detailed integration instructions, see the Stripe documentation.

## 🖼️ Image Upload (Optional)

To enable product image uploads:

1. The object storage is already configured via `COZE_BUCKET_ENDPOINT_URL` and `COZE_BUCKET_NAME`
2. Use the `S3Storage` class from `coze-coding-dev-sdk`:
   ```typescript
   import { S3Storage } from 'coze-coding-dev-sdk';

   const storage = new S3Storage({
     endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
     bucketName: process.env.COZE_BUCKET_NAME,
   });

   const fileKey = await storage.uploadFile({
     fileContent: buffer,
     fileName: `products/${filename}`,
     contentType: file.type,
   });

   const imageUrl = await storage.generatePresignedUrl({
     key: fileKey,
     expireTime: 86400,
   });
   ```
3. Update the product creation/editing pages to include file uploads

## 🚀 Deployment

This project is ready for deployment on Vercel:

1. **Push your code** to your Git repository
2. **Connect to Vercel** - Import your repository
3. **Configure environment variables** - Add all required variables
4. **Deploy** - Vercel will automatically build and deploy

The project includes:
- ✅ `.coze` configuration for build and run
- ✅ Production-ready Next.js configuration
- ✅ Optimized for Vercel deployment

## 📝 Database Schema

### Products Table
```sql
- id (UUID, primary key)
- name (varchar, required)
- slug (varchar, unique, required)
- description (text, required)
- price (numeric, required)
- compare_price (numeric, optional)
- image_url (varchar, required)
- images (text array, optional)
- stock (integer, default 0)
- category_id (UUID, foreign key)
- is_active (boolean, default true)
- is_featured (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

### Orders Table
```sql
- id (UUID, primary key)
- user_id (UUID, required)
- order_number (varchar, unique, required)
- status (varchar, default 'pending')
- total (numeric, required)
- subtotal (numeric, required)
- tax (numeric, default 0)
- shipping (numeric, default 0)
- payment_status (varchar, default 'pending')
- payment_method (varchar)
- stripe_payment_intent_id (varchar)
- shipping_address_id (UUID, foreign key)
- notes (text, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🔒 Security

- ✅ **Row Level Security** enabled on all tables
- ✅ **Supabase Auth** for user authentication
- ✅ **API route protection** with auth checks
- ✅ **Type-safe** database operations
- ✅ **Secure payment flow** (when configured)

## 🎨 Customization

### Change Colors
Edit `src/app/globals.css` to customize the color scheme.

### Add Products
Use the admin panel at `/admin/products` or add via API.

### Modify Layout
Edit `src/app/layout.tsx` and `src/components/Navigation.tsx`.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Stripe Documentation](https://stripe.com/docs)

## 🤝 Support

For issues or questions:
1. Check the documentation above
2. Review the code comments
3. Check the Supabase dashboard for database issues

## 📄 License

This project is provided as-is for educational and commercial use.

---

**Built with ❤️ using Next.js, Supabase, and TypeScript**
