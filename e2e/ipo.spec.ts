import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { expect, test, type APIRequestContext } from "@playwright/test";

const origin = "http://localhost:3101";
const headers = { Origin: origin };

const listingPerformance = {
  symbol: "BREN.JK",
  chg_7d: 2.52564,
  chg_30d: 4.64103,
  chg_90d: 8.26282,
  chg_365d: 7.58974,
  company_name: "PT Barito Renewables Energy Tbk.",
  listing_date: null,
  shares_offered: 4015000000,
  percent_total_shares: 0.03,
  book_building_start_date: "2023-09-18",
  book_building_end_date: "2023-09-25",
  book_building_lower_bound: 670,
  book_building_upper_bound: 780,
  offering_start_date: "2023-10-03",
  offering_end_date: "2023-10-05",
  offering_price: 780,
  distribution_date: "2023-10-06",
  prospectus_url:
    "https://e-ipo.co.id/en/pipeline/get-propectus-file?id=266&type=",
  additional_info_url:
    "https://e-ipo.co.id/en/pipeline/get-additional-info?id=266",
};

async function signUp(client: APIRequestContext) {
  const data = {
    name: "IPO Analyst",
    email: `ipo-${randomUUID()}@example.com`,
    password: "IPO-test-password-123!",
  };
  let response = await client.post("/api/auth/sign-up/email", {
    headers,
    data,
  });
  if (response.status() === 429) {
    const seconds = Number(response.headers()["retry-after"] || 10);
    await delay((Math.min(seconds, 10) + 0.1) * 1000);
    response = await client.post("/api/auth/sign-up/email", { headers, data });
  }
  expect(response.status()).toBe(200);
}

test("the IPO API requires a session and validates the IDX symbol", async ({
  request,
}) => {
  const anonymous = await request.get("/api/ipo/?symbol=BREN");
  expect(anonymous.status()).toBe(401);
  expect(await anonymous.json()).toEqual({
    error: { code: "UNAUTHORIZED", message: "Sign in to continue." },
  });
  expect(anonymous.headers()["cache-control"]).toContain("no-store");

  await signUp(request);
  for (const query of [
    "",
    "symbol=TOOLONG",
    "symbol=BBCA",
    "symbol=BREN&unexpected=true",
  ]) {
    const response = await request.get(`/api/ipo/?${query}`);
    expect(response.status()).toBe(422);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
  }

  const unavailable = await request.get("/api/ipo/?symbol=bren");
  expect(unavailable.status()).toBe(503);
  expect((await unavailable.json()).error.code).toBe("NOT_CONFIGURED");
});

test("the IPO sidebar page renders the documented response", async ({
  context,
  page,
}) => {
  await signUp(context.request);
  await page.route("**/api/ipo/**", async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get("symbol")).toBe("BREN");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: listingPerformance }),
    });
  });

  await page.goto("/app");
  await page.getByRole("link", { name: "IPO", exact: true }).click();
  await expect(page).toHaveURL(/\/ipo$/);
  await expect(
    page.getByRole("heading", { name: "IPO Monitor" }),
  ).toBeVisible();
  for (const item of ["ARTO", "ASLI", "BREN", "BUKA", "GOTO"]) {
    await expect(
      page.getByRole("button", { name: item, exact: true }),
    ).toBeVisible();
  }

  await page.getByLabel("Simbol IDX").fill("bren");
  await page.getByRole("button", { name: "Muat Data IPO" }).click();

  const result = page.getByTestId("ipo-result");
  await expect(result).toBeVisible();
  await expect(
    result.getByRole("heading", {
      name: "PT Barito Renewables Energy Tbk.",
    }),
  ).toBeVisible();
  await expect(
    result.getByText("BREN.JK", { exact: true }).first(),
  ).toBeVisible();
  await expect(result.getByText("+2,52564%", { exact: true })).toBeVisible();
  await expect(result.getByText("4.015.000.000 saham")).toBeVisible();
  await expect(result.getByText(/Rp\s*780/).first()).toBeVisible();
  await expect(
    result.getByRole("link", { name: /Prospectus/ }),
  ).toHaveAttribute("href", listingPerformance.prospectus_url);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
