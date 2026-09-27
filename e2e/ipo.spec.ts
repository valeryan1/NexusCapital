import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { expect, test, type APIRequestContext } from "@playwright/test";

const origin = "http://localhost:3101";
const headers = { Origin: origin };

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

  const normalized = await request.get("/api/ipo/?symbol=bren");
  expect([200, 503]).toContain(normalized.status());
  if (normalized.status() === 503)
    expect((await normalized.json()).error.code).toBe("NOT_CONFIGURED");
});

test("the IPO sidebar page renders the official feed state", async ({
  context,
  page,
}) => {
  await signUp(context.request);
  await page.goto("/ipo");
  await expect(
    page.getByRole("heading", { name: "Upcoming IPO Radar" }),
  ).toBeVisible();
  await expect(page.getByText("BEI Official Feed", { exact: true })).toBeVisible();

  const recentButton = page.getByRole("button", {
    name: "Lihat 3 IPO Terakhir",
  });
  if (await recentButton.isVisible()) {
    await recentButton.click();
    await expect(page.getByText("Baru Terdaftar").first()).toBeVisible();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
