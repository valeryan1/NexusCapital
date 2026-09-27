import { db } from "@/db/index.server";
import { watchlist } from "@/db/schema/watchlist";
import { eq, and } from "drizzle-orm";

export async function getWatchlist(userId: string) {
  return db.select().from(watchlist).where(eq(watchlist.userId, userId));
}

export async function addToWatchlist(userId: string, symbol: string, name?: string) {
  const existing = await db
    .select()
    .from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.symbol, symbol)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db
    .insert(watchlist)
    .values({
      id: crypto.randomUUID(),
      userId,
      symbol,
      name,
    })
    .returning();

  return result[0];
}

export async function removeFromWatchlist(userId: string, symbol: string) {
  await db
    .delete(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.symbol, symbol)));
}