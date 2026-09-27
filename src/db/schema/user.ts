import { boolean, pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  credits: integer("credits").default(5).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  creditBalance: integer("credit_balance").default(20).notNull(),
  defaultTenantId: uuid("default_tenant_id"), // Not strictly referencing tenants to avoid circular issues, but conceptually points to tenants.id
  status: text("status").default("active").notNull(),
  locale: text("locale").default("id").notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});
