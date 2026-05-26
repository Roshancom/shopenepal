import {
  mysqlTable,
  text,
  int,
  timestamp,
  decimal,
  boolean,
  varchar,
  json,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  images: json("images").$type<string[]>().notNull(),
  categoryId: int("category_id").notNull(),
  stock: int("stock").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: int("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
