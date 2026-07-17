import assert from "node:assert/strict";
import test from "node:test";
import {
  applyPointEntry,
  assertBalancedJournal,
  assertIdempotencyKeyAvailable,
  createFreezeJournal,
  createPayoutJournal,
  createReleaseJournal,
  createReversalJournal,
  createSettlementJournal,
  reversePointEntry,
} from "../lib/wallet";

const settlement = () =>
  createSettlementJournal({
    orderId: "order-001",
    providerId: "provider-001",
    currency: "twd",
    grossAmountMinor: 10_000,
    platformFeeAmountMinor: 1_000,
    paymentProcessingFeeMinor: 300,
    providerNetAmountMinor: 8_700,
    idempotencyKey: "settlement:order-001",
  });

test("settlement splits the order into a balanced, immutable journal", () => {
  const journal = settlement();

  assert.equal(assertBalancedJournal(journal), true);
  assert.equal(journal.postings.length, 4);
  assert.equal(Object.isFrozen(journal), true);
  assert.equal(Object.isFrozen(journal.postings), true);
  assert.deepEqual(
    journal.postings.map(({ accountCode, direction, amountMinor }) => ({
      accountCode,
      direction,
      amountMinor,
    })),
    [
      { accountCode: "processor_clearing", direction: "debit", amountMinor: 10_000 },
      { accountCode: "platform_fee_revenue", direction: "credit", amountMinor: 1_000 },
      {
        accountCode: "payment_processing_payable",
        direction: "credit",
        amountMinor: 300,
      },
      { accountCode: "provider_pending", direction: "credit", amountMinor: 8_700 },
    ]
  );
});

test("settlement rejects mismatched snapshots and floating point money", () => {
  assert.throws(
    () =>
      createSettlementJournal({
        orderId: "order-bad",
        providerId: "provider-001",
        currency: "TWD",
        grossAmountMinor: 10_000,
        platformFeeAmountMinor: 1_000,
        paymentProcessingFeeMinor: 300,
        providerNetAmountMinor: 8_699,
        idempotencyKey: "settlement:order-bad",
      }),
    /總額不等於/
  );

  assert.throws(
    () =>
      createSettlementJournal({
        orderId: "order-float",
        providerId: "provider-001",
        currency: "TWD",
        grossAmountMinor: 100.5,
        platformFeeAmountMinor: 10,
        paymentProcessingFeeMinor: 5,
        providerNetAmountMinor: 85,
        idempotencyKey: "settlement:order-float",
      }),
    /整數/
  );
});

test("release, freeze, and payout move value without changing the total", () => {
  const common = {
    providerId: "provider-001",
    amountMinor: 8_700,
    currency: "TWD",
    referenceType: "order",
    referenceId: "order-001",
    description: "test",
  };

  const release = createReleaseJournal({ ...common, idempotencyKey: "release:order-001" });
  const freeze = createFreezeJournal({ ...common, idempotencyKey: "freeze:order-001" });
  const payout = createPayoutJournal({ ...common, idempotencyKey: "payout:order-001" });

  assert.equal(assertBalancedJournal(release), true);
  assert.equal(release.postings[0].accountCode, "provider_pending");
  assert.equal(release.postings[1].accountCode, "provider_available");
  assert.equal(freeze.postings[1].accountCode, "provider_frozen");
  assert.equal(payout.postings[1].ownerKey, "payment_processor:default");
});

test("reversal creates compensating postings without changing the original", () => {
  const original = settlement();
  const originalSnapshot = structuredClone(original);
  const reversal = createReversalJournal(original, {
    referenceId: "transaction-001",
    idempotencyKey: "reversal:transaction-001",
    description: "測試沖正",
  });

  assert.deepEqual(original, originalSnapshot);
  assert.equal(assertBalancedJournal(reversal), true);
  assert.equal(reversal.postings[0].direction, "credit");
  assert.equal(reversal.postings[1].direction, "debit");
  assert.equal(reversal.reversalOfIdempotencyKey, original.idempotencyKey);
});

test("duplicate idempotency keys are rejected", () => {
  assert.throws(
    () => assertIdempotencyKeyAvailable(["settlement:order-001"], "settlement:order-001"),
    /不能重複過帳/
  );
});

test("reliability points are append-only, reversible, and never negative", () => {
  const deduction = applyPointEntry({
    accountId: "points-provider-001",
    currentBalancePoints: 100,
    deltaPoints: -5,
    reason: "missed_offer",
    referenceType: "offer",
    referenceId: "offer-001",
    idempotencyKey: "points:offer-001:missed",
  });
  assert.equal(deduction.balanceAfterPoints, 95);
  assert.equal(Object.isFrozen(deduction), true);

  const reversal = reversePointEntry(deduction, {
    originalEntryId: "point-entry-001",
    currentBalancePoints: 95,
    idempotencyKey: "points:point-entry-001:reversal",
  });
  assert.equal(reversal.deltaPoints, 5);
  assert.equal(reversal.balanceAfterPoints, 100);
  assert.equal(reversal.reversalOfEntryId, "point-entry-001");

  assert.throws(
    () =>
      applyPointEntry({
        accountId: "points-provider-001",
        currentBalancePoints: 3,
        deltaPoints: -5,
        reason: "missed_offer",
        referenceType: "offer",
        referenceId: "offer-002",
        idempotencyKey: "points:offer-002:missed",
      }),
    /不能過帳成負數/
  );
});
