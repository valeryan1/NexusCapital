import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { user } from "./user";

export const b2bClients = pgTable("b2b_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull().unique(),
  companyName: text("company_name").notNull(),
  webhookUrl: text("webhook_url"),
  whiteLabelLogoUrl: text("white_label_logo_url"),
  isApproved: boolean("is_approved").default(false).notNull(),
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});
