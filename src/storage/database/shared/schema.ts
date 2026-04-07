import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, numeric, index } from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// System table - must keep
export const healthCheck = pgTable("health_check", {
	id: integer().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

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

// Products table
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
    images: text("images").array(), // Array of image URLs
    stock: integer("stock").notNull().default(0),
    category_id: varchar("category_id", { length: 36 }).references(() => categories.id, { onDelete: "set null" }),
    is_active: boolean("is_active").default(true).notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("products_slug_idx").on(table.slug),
    index("products_category_id_idx").on(table.category_id),
    index("products_is_active_idx").on(table.is_active),
    index("products_is_featured_idx").on(table.is_featured),
  ]
);

// Addresses table
export const addresses = pgTable(
  "addresses",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull(), // References Supabase auth.users
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
    user_id: varchar("user_id", { length: 36 }).notNull(), // References Supabase auth.users
    order_number: varchar("order_number", { length: 50 }).notNull().unique(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default(0),
    shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull().default(0),
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

// Order Items table
export const orderItems = pgTable(
  "order_items",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    order_id: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    product_name: varchar("product_name", { length: 255 }).notNull(),
    product_image: varchar("product_image", { length: 1024 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.order_id),
    index("order_items_product_id_idx").on(table.product_id),
  ]
);

// Cart Items table
export const cartItems = pgTable(
  "cart_items",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull(), // References Supabase auth.users
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

// Zod schemas for validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({ coerce: { date: true } });

export const insertCategorySchema = createCoercedInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  image_url: true,
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
  payment_status: true,
  payment_method: true,
  stripe_payment_intent_id: true,
  shipping_address_id: true,
  notes: true,
});

export const insertOrderItemSchema = createCoercedInsertSchema(orderItems).pick({
  order_id: true,
  product_id: true,
  quantity: true,
  price: true,
  product_name: true,
  product_image: true,
});

export const insertCartItemSchema = createCoercedInsertSchema(cartItems).pick({
  user_id: true,
  product_id: true,
  quantity: true,
});

// Type exports
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
