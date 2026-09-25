import { createFileRoute } from "@tanstack/react-router";
import { ApiError, withApiSession } from "@/lib/api.server";
import {
  getIpoPerformance,
  IpoServiceError,
  type IpoServiceErrorCode,
} from "@/services/ipo.service.server";
import { ipoQuerySchema } from "@/validators/ipo";

const serviceErrors = {
  NOT_CONFIGURED: {
    status: 503,
    message: "Layanan data IPO belum dikonfigurasi.",
  },
  NOT_FOUND: {
    status: 404,
    message: "Data IPO tidak tersedia untuk simbol ini.",
  },
  RATE_LIMIT: {
    status: 429,
    message: "Kuota atau batas permintaan Sectors API tercapai.",
  },
  UPSTREAM_AUTH: {
    status: 502,
    message: "Kunci Sectors API tidak valid atau tidak memiliki akses.",
  },
  TIMEOUT: {
    status: 504,
    message: "Sectors API terlalu lama merespons. Coba lagi.",
  },
  UPSTREAM_UNAVAILABLE: {
    status: 502,
    message: "Sectors API tidak dapat dihubungi. Coba lagi.",
  },
  INVALID_RESPONSE: {
    status: 502,
    message: "Respons Sectors API tidak sesuai format yang diharapkan.",
  },
  UPSTREAM_ERROR: {
    status: 502,
    message: "Sectors API gagal menyediakan data IPO.",
  },
} satisfies Record<IpoServiceErrorCode, { status: number; message: string }>;

export const Route = createFileRoute("/api/ipo/")({
  server: {
    handlers: {
      GET: ({ request }) =>
        withApiSession(request, async () => {
          const { symbol } = ipoQuerySchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          );
          try {
            return Response.json({
              data: await getIpoPerformance({ symbol }),
            });
          } catch (error) {
            if (error instanceof IpoServiceError) {
              const mapped = serviceErrors[error.code];
              throw new ApiError(mapped.status, error.code, mapped.message);
            }
            throw error;
          }
        }),
    },
  },
});
