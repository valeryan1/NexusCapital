import { db } from "@/db/index.server";
import { user } from "@/db/schema/user";
import { eq, sql } from "drizzle-orm";

export async function getCreditBalance(userId: string): Promise<number> {
  const result = await db.select({ credits: user.credits }).from(user).where(eq(user.id, userId)).limit(1);
  return result[0]?.credits ?? 0;
}

export async function consumeCredit(userId: string): Promise<number> {
  const result = await db
    .update(user)
    .set({ credits: sql`${user.credits} - 1` })
    .where(eq(user.id, userId))
    .returning({ credits: user.credits });
  return result[0]?.credits ?? 0;
}

export async function refundCredit(userId: string): Promise<number> {
  const result = await db
    .update(user)
    .set({ credits: sql`${user.credits} + 1` })
    .where(eq(user.id, userId))
    .returning({ credits: user.credits });
  return result[0]?.credits ?? 0;
}