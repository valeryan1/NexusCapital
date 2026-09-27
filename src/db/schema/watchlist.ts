import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export const watchlist = pgTable("watchlist", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const watchlistNotification = pgTable("watchlist_notification", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  symbol: text("symbol").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;
export type WatchlistNotification = typeof watchlistNotification.$inferSelect;
export type NewWatchlistNotification = typeof watchlistNotification.$inferInsert;