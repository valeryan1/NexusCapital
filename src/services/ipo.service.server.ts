import { env } from "@/lib/env.server";
import { ipoPerformanceSchema, type IpoQuery } from "@/validators/ipo";

const sectorsIpoUrl = "https://api.sectors.app/v2/listing-performance";

export type IpoServiceErrorCode =
  | "NOT_CONFIGURED"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "UPSTREAM_AUTH"
  | "TIMEOUT"
  | "UPSTREAM_UNAVAILABLE"
  | "INVALID_RESPONSE"
  | "UPSTREAM_ERROR";

export class IpoServiceError extends Error {
  constructor(
    public readonly code: IpoServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "IpoServiceError";
  }
}

export async function getIpoPerformance({ symbol }: IpoQuery) {
  const apiKey = env.SECTORS_API_KEY;
  if (!apiKey)
    throw new IpoServiceError(
      "NOT_CONFIGURED",
      "SECTORS_API_KEY is not configured.",
    );

  let response: Response;
  try {
    response = await fetch(`${sectorsIpoUrl}/${encodeURIComponent(symbol)}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: apiKey,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    )
      throw new IpoServiceError(
        "TIMEOUT",
        "The Sectors API request timed out.",
      );
    throw new IpoServiceError(
      "UPSTREAM_UNAVAILABLE",
      "The Sectors API could not be reached.",
    );
  }

  if (response.status === 401 || response.status === 403)
    throw new IpoServiceError(
      "UPSTREAM_AUTH",
      "The Sectors API rejected its credentials.",
    );
  if (response.status === 404)
    throw new IpoServiceError(
      "NOT_FOUND",
      "No IPO performance data exists for this symbol.",
    );
  if (response.status === 429)
    throw new IpoServiceError(
      "RATE_LIMIT",
      "The Sectors API rate limit or quota was reached.",
    );
  if (!response.ok)
    throw new IpoServiceError(
      "UPSTREAM_ERROR",
      `The Sectors API returned HTTP ${response.status}.`,
    );

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new IpoServiceError(
      "INVALID_RESPONSE",
      "The Sectors API returned invalid JSON.",
    );
  }

  const result = ipoPerformanceSchema.safeParse(payload);
  if (!result.success)
    throw new IpoServiceError(
      "INVALID_RESPONSE",
      "The Sectors API response did not match the documented schema.",
    );
  return result.data;
}
