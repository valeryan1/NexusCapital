import { db } from "@/db/index.server";
import { watchlistNotification } from "@/db/schema/watchlist";
import { eq, desc } from "drizzle-orm";

export async function getWatchlistNotifications(userId: string) {
  return db
    .select()
    .from(watchlistNotification)
    .where(eq(watchlistNotification.userId, userId))
    .orderBy(desc(watchlistNotification.createdAt))
    .limit(50);
}

export async function markNotificationsAsRead(userId: string) {
  await db
    .update(watchlistNotification)
    .set({ readAt: new Date() })
    .where(eq(watchlistNotification.userId, userId));
}

export async function createNotification(
  userId: string,
  data: {
    kind: string;
    symbol: string;
    title: string;
    body: string;
  }
) {
  const result = await db
    .insert(watchlistNotification)
    .values({
      id: crypto.randomUUID(),
      userId,
      ...data,
    })
    .returning();

  return result[0];
}