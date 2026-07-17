import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const migrationDirectory = fileURLToPath(new URL("../drizzle/", import.meta.url));

function migratedDatabase() {
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON;");
  for (const filename of readdirSync(migrationDirectory)
    .filter((item) => item.endsWith(".sql"))
    .sort()) {
    database.exec(readFileSync(new URL(`../drizzle/${filename}`, import.meta.url), "utf8"));
  }
  return database;
}

test("v0.2 migration applies with every required operational table", () => {
  const database = migratedDatabase();
  const requiredTables = [
    "games",
    "service_categories",
    "provider_applications",
    "provider_profiles",
    "provider_services",
    "orders",
    "reviews",
    "pricing_suggestions",
    "commission_rules",
    "concierge_requests",
    "support_cases",
    "reports",
    "disputes",
    "dispute_evidence",
    "moderation_actions",
    "audit_logs",
    "owner_presence",
    "ledger_accounts",
    "ledger_transactions",
    "ledger_postings",
    "provider_point_accounts",
    "provider_point_entries",
    "wallet_credit_accounts",
    "wallet_credit_entries",
  ];

  const actualTables = database
    .prepare("select name from sqlite_master where type = 'table'")
    .all()
    .map((row) => row.name);

  for (const table of requiredTables) {
    assert.ok(actualTables.includes(table), `missing table: ${table}`);
  }
});

test("wallet migration enforces immutable-ledger safety constraints", () => {
  const database = migratedDatabase();
  const provider = database.prepare("select id from provider_profiles limit 1").get();

  database
    .prepare(
      `insert into ledger_accounts
        (id, owner_key, provider_id, account_code, currency)
       values (?, ?, ?, ?, ?)`
    )
    .run("ledger-account-1", `provider:${provider.id}`, provider.id, "provider_pending", "TWD");

  assert.throws(
    () =>
      database
        .prepare(
          `insert into ledger_accounts
            (id, owner_key, provider_id, account_code, currency)
           values (?, ?, ?, ?, ?)`
        )
        .run("ledger-account-duplicate", `provider:${provider.id}`, provider.id, "provider_pending", "TWD"),
    /UNIQUE constraint failed/
  );

  database
    .prepare(
      `insert into ledger_transactions
        (id, event_type, reference_type, reference_id, idempotency_key, description, posted_at)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "ledger-transaction-1",
      "settlement",
      "order",
      "order-demo",
      "settlement:order-demo",
      "test settlement",
      "2026-07-17T00:00:00.000Z"
    );

  assert.throws(
    () =>
      database
        .prepare(
          `insert into ledger_postings
            (id, transaction_id, account_id, direction, amount_minor, currency)
           values (?, ?, ?, ?, ?, ?)`
        )
        .run(
          "ledger-posting-zero",
          "ledger-transaction-1",
          "ledger-account-1",
          "credit",
          0,
          "TWD"
        ),
    /CHECK constraint failed/
  );

  assert.throws(
    () =>
      database
        .prepare(
          `insert into provider_point_accounts
            (id, provider_id, balance_points)
           values (?, ?, ?)`
        )
        .run("point-account-negative", provider.id, -1),
    /CHECK constraint failed/
  );

  database
    .prepare(
      `insert into wallet_credit_accounts
        (id, owner_type, owner_key, provider_id, backing_currency, redeemable_points)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      "wallet-provider-1",
      "provider",
      `provider:${provider.id}`,
      provider.id,
      "TWD",
      20
    );

  assert.throws(
    () =>
      database
        .prepare(
          `insert into wallet_credit_accounts
            (id, owner_type, owner_key, provider_id, backing_currency)
           values (?, ?, ?, ?, ?)`
        )
        .run(
          "wallet-provider-duplicate",
          "provider",
          `provider:${provider.id}`,
          provider.id,
          "TWD"
        ),
    /UNIQUE constraint failed/
  );

  assert.throws(
    () =>
      database
        .prepare(
          `insert into wallet_credit_accounts
            (id, owner_type, owner_key, backing_currency, available_points)
           values (?, ?, ?, ?, ?)`
        )
        .run("wallet-negative", "player", "player:negative", "TWD", -1),
    /CHECK constraint failed/
  );

  database
    .prepare(
      `insert into wallet_credit_entries
        (id, account_id, event_type, points_amount,
         redeemable_delta_points, available_after_points, held_after_points,
         pending_after_points, redeemable_after_points, frozen_after_points,
         twd_value_minor, twd_minor_per_point_snapshot,
         reference_type, reference_id, idempotency_key, rule_version, reason)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "wallet-entry-penalty",
      "wallet-provider-1",
      "missed_offer_penalty",
      5,
      -5,
      0,
      0,
      0,
      15,
      0,
      500,
      100,
      "offer",
      "offer-001",
      "penalty:offer-001",
      "missed-offer-v1",
      "一分鐘內未接受邀請"
    );

  assert.throws(
    () =>
      database
        .prepare(
          `insert into wallet_credit_entries
            (id, account_id, event_type, points_amount,
             available_after_points, held_after_points, pending_after_points,
             redeemable_after_points, frozen_after_points,
             twd_value_minor, twd_minor_per_point_snapshot,
             reference_type, reference_id, idempotency_key, reason)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          "wallet-entry-no-delta",
          "wallet-provider-1",
          "adjustment",
          1,
          0,
          0,
          0,
          15,
          0,
          100,
          100,
          "manual",
          "manual-001",
          "manual:no-delta",
          "invalid"
        ),
    /CHECK constraint failed/
  );
});

test("migration seeds replaceable games, services, providers, and owner queues", () => {
  const database = migratedDatabase();

  assert.equal(database.prepare("select count(*) as count from games").get().count, 3);
  assert.equal(
    database.prepare("select count(*) as count from provider_profiles").get().count,
    6
  );
  assert.equal(
    database.prepare("select count(*) as count from provider_services").get().count,
    6
  );
  assert.equal(
    database.prepare("select count(*) as count from provider_applications").get().count,
    3
  );
  assert.equal(
    database.prepare("select count(*) as count from concierge_requests").get().count,
    2
  );
});

test("initial commission rules preserve the agreed source-based rates", () => {
  const database = migratedDatabase();
  const rates = Object.fromEntries(
    database
      .prepare(
        "select acquisition_source, platform_fee_rate_bps from commission_rules order by acquisition_source"
      )
      .all()
      .map((row) => [row.acquisition_source, row.platform_fee_rate_bps])
  );

  assert.deepEqual(rates, {
    organic_platform: 1000,
    promoted_platform: 1200,
    provider_first_orders: 0,
    provider_referred: 500,
  });
});

test("CN policy is modeled but disabled for this deployment", () => {
  const database = migratedDatabase();
  const cn = database.prepare("select data_plane, enabled from regions where code = 'CN'").get();
  assert.deepEqual({ ...cn }, { data_plane: "cn", enabled: 0 });
});
