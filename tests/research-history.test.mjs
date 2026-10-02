import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";

const {
  getLatestResearchByTicker,
  getResearchHistory,
  saveResearchSnapshot,
} = await import("../src/services/research.service.server.ts");

test("research history is saved and returned per user", async () => {
  const url = process.env.STARTER_TEST_DATABASE_URL;
  assert.ok(
    url && process.env.STARTER_TEST_RUN?.startsWith("starter-pg-test-"),
    "Run npm test to create an isolated database.",
  );

  const db = new Pool({ connectionString: url, max: 1 });
  try {
    process.env.USE_DUMMY_RESEARCH = "true";
    await db.query('INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3)', [
      "history-user",
      "History User",
      "history@example.com",
    ]);
    await db.query(
      'INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3)',
      ["another-user", "Another User", "another@example.com"],
    );

    const item = await saveResearchSnapshot({
      userId: "history-user",
      ticker: "BBCA",
      companyName: "PT Bank Central Asia Tbk",
      reportType: "full",
      nexusScore: 82,
      rawDataSnapshot: { ticker: "BBCA", companyName: "PT Bank Central Asia Tbk" },
    });

    const latest = await getLatestResearchByTicker("history-user", "BBCA");
    assert.equal(latest?.ticker, "BBCA");
    assert.equal(latest?.companyName, "PT Bank Central Asia Tbk");

    const dummy = await import("../src/services/research.service.server.ts").then(({ generateResearchReport }) =>
      generateResearchReport("BBCA", "history-user"),
    );
    assert.equal(dummy.ticker, "BBCA");
    assert.equal(dummy.companyName, "PT Bank Central Asia Tbk");

    assert.equal(item.ticker, "BBCA");
    assert.equal(item.userId, "history-user");
    assert.ok(item.id);

    const rows = await getResearchHistory("history-user");
    assert.equal(rows.length >= 1, true);
    assert.equal(rows[0].ticker, "BBCA");
    assert.equal(rows[0].companyName, "PT Bank Central Asia Tbk");

    const otherUserRows = await getResearchHistory("another-user");
    assert.deepEqual(otherUserRows, []);
  } finally {
    await db.end();
  }
});
