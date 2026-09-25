import { z } from "zod";

const nullableNumber = z.number().finite().nullable();
const nullableInteger = z.number().int().nullable();
const nullableDate = z.iso.date().nullable();
const nullableUrl = z.url().nullable();

export const ipoSymbols = ["ARTO", "ASLI", "BREN", "BUKA", "GOTO"] as const;

const requestedSymbol = z.enum(ipoSymbols, {
  error: `Pilih salah satu simbol: ${ipoSymbols.join(", ")}.`,
});
const responseSymbol = z
  .string()
  .regex(
    /^[A-Z]{4}(?:\.JK)?$/,
    "Gunakan empat huruf, misalnya BREN atau BREN.JK.",
  );

export const ipoQuerySchema = z
  .object({
    symbol: z.string().trim().toUpperCase().pipe(requestedSymbol),
  })
  .strict();

export const ipoPerformanceSchema = z
  .object({
    symbol: responseSymbol,
    chg_7d: nullableNumber,
    chg_30d: nullableNumber,
    chg_90d: nullableNumber,
    chg_365d: nullableNumber,
    company_name: z.string().nullable(),
    listing_date: nullableDate,
    shares_offered: nullableInteger,
    percent_total_shares: nullableNumber,
    book_building_start_date: nullableDate,
    book_building_end_date: nullableDate,
    book_building_lower_bound: nullableInteger,
    book_building_upper_bound: nullableInteger,
    offering_start_date: nullableDate,
    offering_end_date: nullableDate,
    offering_price: nullableInteger,
    distribution_date: nullableDate,
    prospectus_url: nullableUrl,
    additional_info_url: nullableUrl,
  })
  .strict();

export type IpoQuery = z.infer<typeof ipoQuerySchema>;
export type IpoPerformance = z.infer<typeof ipoPerformanceSchema>;
