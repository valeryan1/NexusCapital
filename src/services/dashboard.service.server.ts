import { db } from "@/db/index.server";
import { user, reports, alertTriggers } from "@/db/schema";
import { count, eq, sum } from "drizzle-orm";
import { getCreditBalance } from "./credit.service.server";

export async function getDashboardStats(userId: string) {
  // 1. Get credits
  const credits = await getCreditBalance(userId);

  // 2. Get total reports generated
  const reportsResult = await db
    .select({ count: count() })
    .from(reports)
    .where(eq(reports.userId, userId));
  const totalReports = reportsResult[0]?.count ?? 0;

  // 3. Get total active alerts
  const alertsResult = await db
    .select({ count: count() })
    .from(alertTriggers)
    .where(eq(alertTriggers.userId, userId));
  const activeAlerts = alertsResult[0]?.count ?? 0;

  // 4. Get total tokens processed (sum of tokensUsed in reports)
  const tokensResult = await db
    .select({ totalTokens: sum(reports.tokensUsed) })
    .from(reports)
    .where(eq(reports.userId, userId));
  
  // sum returns string in postgres, so we parse it
  const tokensProcessedStr = tokensResult[0]?.totalTokens ?? "0";
  const tokensProcessed = parseInt(tokensProcessedStr as string, 10);
  
  // Format tokens to compact notation (e.g. 1.2M, 50K)
  const formatTokens = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return {
    credits,
    totalReports,
    activeAlerts,
    tokensProcessed: formatTokens(tokensProcessed),
  };
}
