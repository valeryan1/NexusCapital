import { pgTable, uuid, text, integer, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { user } from "./user";
import { tenants } from "./tenants";

export const paymentIntents = pgTable("payment_intents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerReference: text("provider_reference").unique().notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  credits: integer("credits").notNull(),
  status: text("status").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  rawResponse: json("raw_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
