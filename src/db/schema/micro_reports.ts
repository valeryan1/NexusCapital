import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { alertTriggers } from "./alert_triggers";
import { tenants } from "./tenants";
import { reports } from "./reports";

export const microReports = pgTable("micro_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  triggerId: uuid("trigger_id").references(() => alertTriggers.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  reportId: uuid("report_id").references(() => reports.id, { onDelete: "set null" }),
  narrativeReport: text("narrative_report").notNull(),
  dispatchedToWebhook: boolean("dispatched_to_webhook").default(false).notNull(),
  webhookStatus: text("webhook_status").default("pending").notNull(),
  webhookAttempts: integer("webhook_attempts").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
