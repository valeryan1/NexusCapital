import { pgTable, uuid, text, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { tenants } from "./tenants";

export const alertTriggers = pgTable("alert_triggers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  ticker: text("ticker").notNull(),
  conditionType: text("condition_type").notNull(),
  thresholdPercent: decimal("threshold_percent", { precision: 5, scale: 2 }).notNull(),
  cooldownMinutes: integer("cooldown_minutes").default(30).notNull(),
  maxTriggersPerDay: integer("max_triggers_per_day").default(10).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
