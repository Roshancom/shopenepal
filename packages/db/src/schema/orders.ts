import {
  mysqlTable,
  text,
  int,
  timestamp,
  decimal,
  json,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: text("session_id"),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  items: json("items").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryCharge: decimal("delivery_charge", { precision: 10, scale: 2 })
    .notNull()
    .default("100"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  paymentStatus: varchar("payment_status", { length: 50 })
    .notNull()
    .default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 })
    .notNull()
    .default("esewa"),
  esewaRefId: varchar("esewa_ref_id", { length: 255 }),
  transactionUuid: varchar("transaction_uuid", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
