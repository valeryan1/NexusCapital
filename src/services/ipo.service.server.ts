import { z } from "zod";
import { env } from "@/lib/env.server";
import { ipoPerformanceSchema, type IpoQuery } from "@/validators/ipo";

const sectorsIpoUrl = "https://api.sectors.app/v2/listing-performance";
const idxOrigin = "https://www.idx.id";
const idxActivityPath = "/primary/ListingActivity/GetIpoRelisting";
const idxProspectusPath = "/primary/ListedCompany/GetProspectusItem";
const idxBootstrapUrl = `${idxOrigin}/id/perusahaan-tercatat/aktivitas-pencatatan`;
const idxActivityPageUrl = `${idxOrigin}/id/perusahaan-tercatat/aktivitas-pencatatan`;
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const idxActivitySchema = z.object({
  Result: z.array(
    z.object({
      EfekEmiten_Saham: z.boolean(),
      EfekType: z.string().nullable(),
      KodeEmiten: z.string(),
      NamaEmiten: z.string(),
      PapanPencatatan: z.string().nullable(),
      RencanaStatus: z.string().nullable(),
      SahamIPOValue: z.number().nullable(),
      TanggalPencatatan: z.string(),
    }),
  ),
});

const idxProspectusSchema = z.object({
  data: z.array(
    z.object({
      Description: z.string(),
      ListingDate: z.string(),
      Prospectus: z.url().nullable(),
    }),
  ),
});

const idxIpoSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  board: z.string().nullable(),
  listingDate: z.string(),
  sharesOffered: z.number().nullable(),
  status: z.string(),
  isRelisting: z.boolean(),
  isUpcoming: z.boolean(),
  prospectusUrl: z.url().nullable(),
  sourceUrl: z.url(),
});

const idxIpoFeedSchema = z.object({
  upcoming: z.array(idxIpoSchema),
  recentListed: z.array(idxIpoSchema),
});

export type IdxIpo = z.infer<typeof idxIpoSchema>;
export type IdxIpoFeed = z.infer<typeof idxIpoFeedSchema>;

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

async function createIdxSession() {
  let response: Response;
  try {
    response = await fetch(idxBootstrapUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": userAgent,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new IpoServiceError(
      "UPSTREAM_UNAVAILABLE",
      "IDX tidak dapat dihubungi.",
    );
  }

  if (!response.ok)
    throw new IpoServiceError(
      "UPSTREAM_ERROR",
      `IDX mengembalikan HTTP ${response.status}.`,
    );

  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");

  if (!cookie)
    throw new IpoServiceError(
      "INVALID_RESPONSE",
      "Sesi IDX tidak dapat dibuat.",
    );

  return { cookie };
}

async function fetchIdxJson<T>(
  session: { cookie: string },
  path: string,
  params: Record<string, string>,
  schema: z.ZodType<T>,
) {
  const url = new URL(path, idxOrigin);
  url.search = new URLSearchParams(params).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json, text/plain, */*",
        Cookie: session.cookie,
        Referer: idxActivityPageUrl,
        "User-Agent": userAgent,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new IpoServiceError(
      "UPSTREAM_UNAVAILABLE",
      "IDX tidak dapat dihubungi.",
    );
  }

  if (response.status === 429)
    throw new IpoServiceError(
      "RATE_LIMIT",
      "Batas permintaan IDX tercapai.",
    );
  if (!response.ok)
    throw new IpoServiceError(
      "UPSTREAM_ERROR",
      `IDX mengembalikan HTTP ${response.status}.`,
    );

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new IpoServiceError(
      "INVALID_RESPONSE",
      "IDX mengembalikan JSON yang tidak valid.",
    );
  }

  const result = schema.safeParse(payload);
  if (!result.success)
    throw new IpoServiceError(
      "INVALID_RESPONSE",
      "Respons IDX tidak sesuai dengan format yang diharapkan.",
    );
  return result.data;
}

function jakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function getIdxIpoFeed(): Promise<IdxIpoFeed> {
  const session = await createIdxSession();
  const today = jakartaDate();
  const year = Number(today.slice(0, 4));

  const [activities, currentProspectuses, nextProspectuses] = await Promise.all([
    fetchIdxJson(
      session,
      idxActivityPath,
      {
        indexfrom: "0",
        Language: "id-id",
        pagesize: "1000",
      },
      idxActivitySchema,
    ),
    fetchIdxJson(
      session,
      idxProspectusPath,
      { lang: "id", start: "0", length: "9999", year: String(year) },
      idxProspectusSchema,
    ),
    fetchIdxJson(
      session,
      idxProspectusPath,
      { lang: "id", start: "0", length: "9999", year: String(year + 1) },
      idxProspectusSchema,
    ),
  ]);

  const prospectuses = [...currentProspectuses.data, ...nextProspectuses.data];
  const listed = activities.Result.filter(
    (item) =>
      item.EfekEmiten_Saham && item.EfekType === "saham",
  );
  const toIpo = (
    item: (typeof listed)[number],
    isUpcoming: boolean,
  ): IdxIpo => {
    const prospectus = prospectuses.find((entry) =>
      entry.Description.includes(`(${item.KodeEmiten})`),
    );
    const isRelisting = item.RencanaStatus !== "baru";

    return {
      symbol: item.KodeEmiten,
      companyName: item.NamaEmiten,
      board: item.PapanPencatatan,
      listingDate: item.TanggalPencatatan.slice(0, 10),
      sharesOffered: item.SahamIPOValue,
      status: isUpcoming
        ? isRelisting
          ? "Relisting Mendatang"
          : "IPO Mendatang"
        : isRelisting
          ? "Relisting"
          : "Baru Terdaftar",
      isRelisting,
      isUpcoming,
      prospectusUrl: prospectus?.Prospectus ?? null,
      sourceUrl: idxActivityPageUrl,
    };
  };

  const upcoming = listed
    .filter((item) => item.TanggalPencatatan.slice(0, 10) >= today)
    .sort((left, right) =>
      left.TanggalPencatatan.localeCompare(right.TanggalPencatatan),
    )
    .map((item) => toIpo(item, true));
  const recentListed = listed
    .filter((item) => item.TanggalPencatatan.slice(0, 10) < today)
    .sort((left, right) =>
      right.TanggalPencatatan.localeCompare(left.TanggalPencatatan),
    )
    .slice(0, 3)
    .map((item) => toIpo(item, false));

  return idxIpoFeedSchema.parse({
    upcoming,
    recentListed,
  });
}
