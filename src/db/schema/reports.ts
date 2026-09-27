import { pgTable, uuid, text, integer, json, timestamp, decimal } from "drizzle-orm/pg-core";
import { user } from "./user";
import { tenants } from "./tenants";

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  ticker: text("ticker").notNull(),
  reportType: text("report_type").notNull(),
  language: text("language").default("id").notNull(),
  status: text("status").notNull(),
  nexusScore: integer("nexus_score"),
  scoreLabel: text("score_label"),
  fundamentalAnalysis: text("fundamental_analysis"),
  technicalAnalysis: text("technical_analysis"),
  finalSynthesis: text("final_synthesis"),
  rawDataSnapshot: json("raw_data_snapshot"),
  pdfUrl: text("pdf_url"),
  requestId: text("request_id").unique().notNull(),
  tokensUsed: integer("tokens_used"),
  costEstimate: decimal("cost_estimate", { precision: 10, scale: 6 }),
  processingTimeMs: integer("processing_time_ms"),
  errorMessage: text("error_message"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
