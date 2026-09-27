import { pgTable, uuid, text, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { apiKeys } from "./api_keys";

export const apiUsageLogs = pgTable("api_usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  apiKeyId: uuid("api_key_id").references(() => apiKeys.id, { onDelete: "set null" }),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code").notNull(),
  requestId: text("request_id").notNull(),
  creditsUsed: integer("credits_used").notNull(),
  tokensIn: integer("tokens_in"),
  tokensOut: integer("tokens_out"),
  costEstimate: decimal("cost_estimate", { precision: 10, scale: 6 }),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
