import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { expect, test, request as playwrightRequest, type APIRequestContext } from "@playwright/test";

const origin = "http://localhost:3101";
const headers = { Origin: origin };

async function signUp(client: APIRequestContext, label: string) {
  const data = {
    name: `Chat ${label}`,
    email: `chat-${label}-${randomUUID()}@example.com`,
    password: "Chat-history-password-123!",
  };
  let response = await client.post("/api/auth/sign-up/email", {
    headers,
    data,
  });
  if (response.status() === 429) {
    const seconds = Number(response.headers()["retry-after"] || 10);
    expect(Number.isFinite(seconds) && seconds >= 0 && seconds <= 10).toBe(true);
    await delay((seconds + 0.1) * 1000);
    response = await client.post("/api/auth/sign-up/email", { headers, data });
  }
  expect(response.status()).toBe(200);
}

test("every chat history operation requires a real session", async ({
  request,
}) => {
  const id = randomUUID();
  for (const [method, url] of [
    ["GET", "/api/chat/conversations"],
    ["POST", "/api/chat/conversations"],
    ["GET", `/api/chat/conversations/${id}`],
    ["PATCH", `/api/chat/conversations/${id}`],
    ["DELETE", `/api/chat/conversations/${id}`],
    ["POST", `/api/chat/conversations/${id}/messages`],
  ]) {
    const response = await request.fetch(url, { method, headers });
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: "Sign in to continue." },
    });
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
});

test("conversations are created, listed, renamed, and deleted for their owner", async ({
  request,
}) => {
  await signUp(request, "owner");

  const empty = await request.get("/api/chat/conversations", { headers });
  expect(empty.status()).toBe(200);
  expect(await empty.json()).toEqual({ data: [] });

  const created = await request.post("/api/chat/conversations", {
    headers,
    data: {},
  });
  expect(created.status()).toBe(201);
  const { data: conversation } = await created.json();
  expect(conversation.title).toBe("Percakapan baru");
  expect(conversation.messageCount).toBe(0);
  expect(created.headers()["location"]).toBe(
    `/api/chat/conversations/${conversation.id}`,
  );

  const titled = await request.post("/api/chat/conversations", {
    headers,
    data: { title: "  Analisis BBCA  " },
  });
  expect(titled.status()).toBe(201);
  const { data: second } = await titled.json();
  expect(second.title).toBe("Analisis BBCA");

  const list = await request.get("/api/chat/conversations?limit=10", {
    headers,
  });
  expect(list.status()).toBe(200);
  const { data: rows } = await list.json();
  expect(rows.map((row: { id: string }) => row.id)).toEqual([
    second.id,
    conversation.id,
  ]);

  const detail = await request.get(`/api/chat/conversations/${conversation.id}`, {
    headers,
  });
  expect(detail.status()).toBe(200);
  const { data: loaded } = await detail.json();
  expect(loaded.messages).toEqual([]);

  const renamed = await request.patch(`/api/chat/conversations/${conversation.id}`, {
    headers,
    data: { title: "Rapat MSCI" },
  });
  expect(renamed.status()).toBe(200);
  expect((await renamed.json()).data.title).toBe("Rapat MSCI");

  const removed = await request.delete(
    `/api/chat/conversations/${conversation.id}`,
    { headers },
  );
  expect(removed.status()).toBe(204);

  const afterDelete = await request.get("/api/chat/conversations", { headers });
  const { data: remaining } = await afterDelete.json();
  expect(remaining.map((row: { id: string }) => row.id)).toEqual([second.id]);

  const gone = await request.get(`/api/chat/conversations/${conversation.id}`, {
    headers,
  });
  expect(gone.status()).toBe(404);
  expect((await gone.json()).error.code).toBe("NOT_FOUND");
});

test("chat history inputs are validated before any query runs", async ({
  request,
}) => {
  await signUp(request, "validation");

  const extraField = await request.post("/api/chat/conversations", {
    headers,
    data: { title: "Rahasia", userId: "dipalsukan" },
  });
  expect(extraField.status()).toBe(422);

  const created = await request.post("/api/chat/conversations", {
    headers,
    data: {},
  });
  const { data: conversation } = await created.json();

  const missingTitle = await request.patch(
    `/api/chat/conversations/${conversation.id}`,
    { headers, data: {} },
  );
  expect(missingTitle.status()).toBe(422);

  const badId = await request.get("/api/chat/conversations/bukan-uuid", {
    headers,
  });
  expect(badId.status()).toBe(422);

  const emptyMessage = await request.post(
    `/api/chat/conversations/${conversation.id}/messages`,
    { headers, data: { content: "   " } },
  );
  expect(emptyMessage.status()).toBe(422);

  const unknownConversation = await request.post(
    `/api/chat/conversations/${randomUUID()}/messages`,
    { headers, data: { content: "Halo" } },
  );
  expect(unknownConversation.status()).toBe(404);
});

test("one account can never read, rename, or delete another account's history", async ({
  request,
}) => {
  await signUp(request, "first");
  const created = await request.post("/api/chat/conversations", {
    headers,
    data: { title: "Rahasia eigenvalue" },
  });
  const { data: conversation } = await created.json();

  // Konteks terpisah supaya pengujian berjalan sebagai akun lain.
  const otherContext = await playwrightRequest.newContext({
    baseURL: origin,
  });
  await signUp(otherContext, "second");

  const list = await otherContext.get("/api/chat/conversations");
  expect((await list.json()).data).toEqual([]);

  const read = await otherContext.get(
    `/api/chat/conversations/${conversation.id}`,
  );
  expect(read.status()).toBe(404);

  const rename = await otherContext.patch(
    `/api/chat/conversations/${conversation.id}`,
    { headers, data: { title: "Dibajak" } },
  );
  expect(rename.status()).toBe(404);

  const remove = await otherContext.delete(
    `/api/chat/conversations/${conversation.id}`,
    { headers },
  );
  expect(remove.status()).toBe(404);

  await otherContext.dispose();

  const ownerList = await request.get("/api/chat/conversations", { headers });
  const ownerRows = (await ownerList.json()).data;
  expect(ownerRows.some((row: { id: string }) => row.id === conversation.id)).toBe(
    true,
  );
});
