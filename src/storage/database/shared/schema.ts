import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, numeric, index, jsonb, json } from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// System table - must keep
export const healthCheck = pgTable("health_check", {
	id: integer().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Admin Roles table
export const adminRoles = pgTable(
  "admin_roles",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 50 }).notNull().unique(), // 'super_admin', 'admin', 'manager'
    display_name: varchar("display_name", { length: 100 }).notNull(),
    description: text("description"),
    permissions: json("permissions").notNull().$type<string[]>(), // Array of permission strings
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("admin_roles_name_idx").on(table.name),
  ]
);

// Admin Users table
export const adminUsers = pgTable(
  "admin_users",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull().unique(), // References Supabase auth.users
    role_id: varchar("role_id", { length: 36 }).notNull().references(() => adminRoles.id),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("admin_users_user_id_idx").on(table.user_id),
    index("admin_users_role_id_idx").on(table.role_id),
  ]
);

// Pages table (CMS)
export const pages = pgTable(
  "pages",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    content: text("content").notNull(),
    meta_title: varchar("meta_title", { length: 255 }),
    meta_description: text("meta_description"),
    is_published: boolean("is_published").default(false).notNull(),
    created_by: varchar("created_by", { length: 36 }),
    updated_by: varchar("updated_by", { length: 36 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("pages_slug_idx").on(table.slug),
    index("pages_is_published_idx").on(table.is_published),
  ]
);

// Site Settings table
export const siteSettings = pgTable(
  "site_settings",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    store_name: varchar("store_name", { length: 255 }).notNull(),
    logo_url: varchar("logo_url", { length: 1024 }),
    favicon_url: varchar("favicon_url", { length: 1024 }),
    primary_color: varchar("primary_color", { length: 7 }).notNull().default('#000000'),
    secondary_color: varchar("secondary_color", { length: 7 }).notNull().default('#ffffff'),
    font_family: varchar("font_family", { length: 100 }).notNull().default('Inter'),
    contact_email: varchar("contact_email", { length: 255 }),
    contact_phone: varchar("contact_phone", { length: 50 }),
    social_media: json("social_media").$type<{ facebook?: string; twitter?: string; instagram?: string; linkedin?: string; }>(),
    platform_fee_percentage: numeric("platform_fee_percentage", { precision: 5, scale: 2 }).notNull().default(10),
    shipping_policy: text("shipping_policy"),
    return_policy: text("return_policy"),
    privacy_policy: text("privacy_policy"),
    terms_of_service: text("terms_of_service"),
    updated_by: varchar("updated_by", { length: 36 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  }
);

// Categories table
export const categories = pgTable(
  "categories",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    image_url: varchar("image_url", { length: 1024 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("categories_slug_idx").on(table.slug),
  ]
);

// Seller Profiles table
export const sellerProfiles = pgTable(
  "seller_profiles",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull().unique(), // References Supabase auth.users
    seller_type: varchar("seller_type", { length: 20 }).notNull(), // 'individual' or 'business'
    status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'approved', 'rejected'
    business_name: varchar("business_name", { length: 255 }),
    registration_number: varchar("registration_number", { length: 100 }),
    business_document_url: varchar("business_document_url", { length: 1024 }),
    tax_id: varchar("tax_id", { length: 100 }),
    bank_account_name: varchar("bank_account_name", { length: 255 }),
    bank_account_number: varchar("bank_account_number", { length: 100 }),
    bank_routing_number: varchar("bank_routing_number", { length: 100 }),
    stripe_account_id: varchar("stripe_account_id", { length: 255 }),
    rejection_reason: text("rejection_reason"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("seller_profiles_user_id_idx").on(table.user_id),
    index("seller_profiles_status_idx").on(table.status),
    index("seller_profiles_seller_type_idx").on(table.seller_type),
  ]
);

// Products table (updated with seller_id)
export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    compare_price: numeric("compare_price", { precision: 10, scale: 2 }),
    image_url: varchar("image_url", { length: 1024 }).notNull(),
    images: text("images").array(),
    stock: integer("stock").notNull().default(0),
    category_id: varchar("category_id", { length: 36 }).references(() => categories.id, { onDelete: "set null" }),
    seller_id: varchar("seller_id", { length: 36 }).references(() => sellerProfiles.id, { onDelete: "set null" }),
    is_active: boolean("is_active").default(true).notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("products_slug_idx").on(table.slug),
    index("products_category_id_idx").on(table.category_id),
    index("products_seller_id_idx").on(table.seller_id),
    index("products_is_active_idx").on(table.is_active),
    index("products_is_featured_idx").on(table.is_featured),
  ]
);

// Addresses table
export const addresses = pgTable(
  "addresses",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    full_name: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    address_line1: varchar("address_line1", { length: 255 }).notNull(),
    address_line2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    postal_code: varchar("postal_code", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).notNull().default("US"),
    is_default: boolean("is_default").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("addresses_user_id_idx").on(table.user_id),
  ]
);

// Orders table
export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    order_number: varchar("order_number", { length: 50 }).notNull().unique(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default(0),
    shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull().default(0),
    platform_fee: numeric("platform_fee", { precision: 10, scale: 2 }).notNull().default(0),
    payment_status: varchar("payment_status", { length: 50 }).notNull().default("pending"),
    payment_method: varchar("payment_method", { length: 50 }),
    stripe_payment_intent_id: varchar("stripe_payment_intent_id", { length: 255 }),
    shipping_address_id: varchar("shipping_address_id", { length: 36 }).references(() => addresses.id),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("orders_user_id_idx").on(table.user_id),
    index("orders_order_number_idx").on(table.order_number),
    index("orders_status_idx").on(table.status),
    index("orders_payment_status_idx").on(table.payment_status),
    index("orders_created_at_idx").on(table.created_at),
  ]
);

// Order Items table (updated with seller_id and seller_payout)
export const orderItems = pgTable(
  "order_items",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    order_id: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
    seller_id: varchar("seller_id", { length: 36 }).references(() => sellerProfiles.id),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    seller_payout: numeric("seller_payout", { precision: 10, scale: 2 }).notNull(),
    platform_fee: numeric("platform_fee", { precision: 10, scale: 2 }).notNull(),
    payout_status: varchar("payout_status", { length: 20 }).notNull().default("pending"), // 'pending', 'paid'
    product_name: varchar("product_name", { length: 255 }).notNull(),
    product_image: varchar("product_image", { length: 1024 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.order_id),
    index("order_items_product_id_idx").on(table.product_id),
    index("order_items_seller_id_idx").on(table.seller_id),
    index("order_items_payout_status_idx").on(table.payout_status),
  ]
);

// Cart Items table
export const cartItems = pgTable(
  "cart_items",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("cart_items_user_id_idx").on(table.user_id),
    index("cart_items_product_id_idx").on(table.product_id),
  ]
);

// Audit Logs table (security tracking)
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    entity_type: varchar("entity_type", { length: 50 }).notNull(),
    entity_id: varchar("entity_id", { length: 36 }),
    ip_address: varchar("ip_address", { length: 50 }).notNull(),
    user_agent: text("user_agent"),
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.user_id),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_entity_type_idx").on(table.entity_type),
    index("audit_logs_entity_id_idx").on(table.entity_id),
    index("audit_logs_created_at_idx").on(table.created_at),
  ]
);

// Zod schemas for validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({ coerce: { date: true } });

export const insertAdminRoleSchema = createCoercedInsertSchema(adminRoles).pick({
  name: true,
  display_name: true,
  description: true,
  permissions: true,
});

export const insertAdminUserSchema = createCoercedInsertSchema(adminUsers).pick({
  user_id: true,
  role_id: true,
  is_active: true,
});

export const insertPageSchema = createCoercedInsertSchema(pages).pick({
  title: true,
  slug: true,
  content: true,
  meta_title: true,
  meta_description: true,
  is_published: true,
  created_by: true,
  updated_by: true,
});

export const insertSiteSettingSchema = createCoercedInsertSchema(siteSettings).pick({
  store_name: true,
  logo_url: true,
  favicon_url: true,
  primary_color: true,
  secondary_color: true,
  font_family: true,
  contact_email: true,
  contact_phone: true,
  social_media: true,
  platform_fee_percentage: true,
  shipping_policy: true,
  return_policy: true,
  privacy_policy: true,
  terms_of_service: true,
  updated_by: true,
});

export const insertCategorySchema = createCoercedInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  image_url: true,
});

export const insertSellerProfileSchema = createCoercedInsertSchema(sellerProfiles).pick({
  user_id: true,
  seller_type: true,
  status: true,
  business_name: true,
  registration_number: true,
  business_document_url: true,
  tax_id: true,
  bank_account_name: true,
  bank_account_number: true,
  bank_routing_number: true,
  stripe_account_id: true,
  rejection_reason: true,
});

export const insertProductSchema = createCoercedInsertSchema(products).pick({
  name: true,
  slug: true,
  description: true,
  price: true,
  compare_price: true,
  image_url: true,
  images: true,
  stock: true,
  category_id: true,
  seller_id: true,
  is_active: true,
  is_featured: true,
});

export const insertAddressSchema = createCoercedInsertSchema(addresses).pick({
  user_id: true,
  full_name: true,
  phone: true,
  address_line1: true,
  address_line2: true,
  city: true,
  state: true,
  postal_code: true,
  country: true,
  is_default: true,
});

export const insertOrderSchema = createCoercedInsertSchema(orders).pick({
  user_id: true,
  status: true,
  total: true,
  subtotal: true,
  tax: true,
  shipping: true,
  platform_fee: true,
  payment_status: true,
  payment_method: true,
  stripe_payment_intent_id: true,
  shipping_address_id: true,
  notes: true,
});

export const insertOrderItemSchema = createCoercedInsertSchema(orderItems).pick({
  order_id: true,
  product_id: true,
  seller_id: true,
  quantity: true,
  price: true,
  seller_payout: true,
  platform_fee: true,
  payout_status: true,
  product_name: true,
  product_image: true,
});

export const insertCartItemSchema = createCoercedInsertSchema(cartItems).pick({
  user_id: true,
  product_id: true,
  quantity: true,
});

// Type exports
export type HealthCheck = typeof healthCheck.$inferSelect;
export type AdminRole = typeof adminRoles.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertAdminRole = z.infer<typeof insertAdminRoleSchema>;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertSellerProfile = z.infer<typeof insertSellerProfileSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
