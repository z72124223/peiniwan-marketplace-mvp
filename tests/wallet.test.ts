import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMissedOfferWalletPenalty,
  assertBalancedJournal,
  completeWalletRedemption,
  createGiftSettlementJournal,
  createMissedOfferPenaltyJournal,
  createPointPurchaseJournal,
  createRedemptionJournal,
  createReversalJournal,
  createServiceSettlementJournal,
  creditProviderPending,
  creditVirtualGiftEarning,
  emptyWalletCreditBalance,
  holdWalletPoints,
  purchaseVirtualGift,
  purchaseWalletPoints,
  releaseProviderPending,
  releaseWalletHold,
  requestWalletRedemption,
  reverseWalletCreditEntry,
  spendHeldWalletPoints,
  type WalletCreditBalance,
} from "../lib/wallet";

const rate = 100;

function balance(overrides: Partial<WalletCreditBalance> = {}): WalletCreditBalance {
  return Object.freeze({ ...emptyWalletCreditBalance(), ...overrides });
}

test("player buys points with TWD and the backing journal stays balanced", () => {
  const credit = purchaseWalletPoints({
    accountId: "wallet-player-1",
    currentBalance: balance(),
    points: 1_000,
    twdMinorPerPointSnapshot: rate,
    referenceType: "payment",
    referenceId: "payment-001",
    idempotencyKey: "purchase:payment-001",
    reason: "玩家購買 1000 點",
  });
  const journal = createPointPurchaseJournal({
    playerId: "player-1",
    points: 1_000,
    twdMinorPerPointSnapshot: rate,
    paymentId: "payment-001",
    idempotencyKey: "ledger:purchase:payment-001",
  });

  assert.equal(credit.balanceAfter.available, 1_000);
  assert.equal(credit.twdValueMinor, 100_000);
  assert.equal(assertBalancedJournal(journal), true);
  assert.equal(journal.postings[1].accountCode, "customer_credit_liability");
});

test("selecting a provider holds player points and timeout returns all of them", () => {
  const held = holdWalletPoints({
    accountId: "wallet-player-1",
    currentBalance: balance({ available: 1_000 }),
    points: 299,
    twdMinorPerPointSnapshot: rate,
    referenceType: "offer",
    referenceId: "offer-001",
    idempotencyKey: "hold:offer-001",
    reason: "玩家選擇陪玩師",
  });
  assert.deepEqual(held.balanceAfter, balance({ available: 701, held: 299 }));

  const released = releaseWalletHold({
    accountId: "wallet-player-1",
    currentBalance: held.balanceAfter,
    points: 299,
    twdMinorPerPointSnapshot: rate,
    referenceType: "offer",
    referenceId: "offer-001",
    idempotencyKey: "release:offer-001",
    reason: "陪玩師一分鐘內未接受，返還玩家",
  });
  assert.deepEqual(released.balanceAfter, balance({ available: 1_000 }));
});

test("one-minute timeout directly deducts redeemable provider wallet points", () => {
  const penalty = applyMissedOfferWalletPenalty({
    accountId: "wallet-provider-1",
    currentBalance: balance({ redeemable: 95 }),
    points: 10,
    twdMinorPerPointSnapshot: rate,
    referenceType: "offer",
    referenceId: "offer-001",
    idempotencyKey: "penalty:offer-001",
    ruleVersion: "missed-offer-v1",
    reason: "一分鐘內未接受邀請並自動下線",
  });
  const journal = createMissedOfferPenaltyJournal({
    providerId: "provider-1",
    offerId: "offer-001",
    points: 10,
    twdMinorPerPointSnapshot: rate,
    idempotencyKey: "ledger:penalty:offer-001",
  });

  assert.equal(penalty.eventType, "missed_offer_penalty");
  assert.equal(penalty.balanceAfter.redeemable, 85);
  assert.equal(penalty.twdValueMinor, 1_000);
  assert.equal(penalty.ruleVersion, "missed-offer-v1");
  assert.equal(assertBalancedJournal(journal), true);
  assert.equal(journal.postings[0].accountCode, "provider_credit_liability");
  assert.equal(journal.postings[1].accountCode, "penalty_reserve");
});

test("provider wallet penalty cannot create a negative cash-value balance", () => {
  assert.throws(
    () =>
      applyMissedOfferWalletPenalty({
        accountId: "wallet-provider-1",
        currentBalance: balance({ redeemable: 5 }),
        points: 10,
        twdMinorPerPointSnapshot: rate,
        referenceType: "offer",
        referenceId: "offer-002",
        idempotencyKey: "penalty:offer-002",
        ruleVersion: "missed-offer-v1",
        reason: "一分鐘內未接受邀請",
      }),
    /不能扣成負數/
  );
});

test("completed service spends held points and creates provider redeemable earnings", () => {
  const spent = spendHeldWalletPoints({
    accountId: "wallet-player-1",
    currentBalance: balance({ held: 500 }),
    points: 500,
    twdMinorPerPointSnapshot: rate,
    referenceType: "order",
    referenceId: "order-001",
    idempotencyKey: "spend:order-001",
    reason: "陪玩服務完成",
  });
  const pending = creditProviderPending({
    accountId: "wallet-provider-1",
    currentBalance: balance(),
    points: 450,
    twdMinorPerPointSnapshot: rate,
    referenceType: "order",
    referenceId: "order-001",
    idempotencyKey: "earning:order-001",
    reason: "陪玩師淨收益待入帳",
  });
  const released = releaseProviderPending({
    accountId: "wallet-provider-1",
    currentBalance: pending.balanceAfter,
    points: 450,
    twdMinorPerPointSnapshot: rate,
    referenceType: "order",
    referenceId: "order-001",
    idempotencyKey: "earning-release:order-001",
    reason: "等待期結束",
  });
  const journal = createServiceSettlementJournal({
    playerId: "player-1",
    providerId: "provider-1",
    orderId: "order-001",
    grossPoints: 500,
    providerNetPoints: 450,
    platformFeePoints: 50,
    twdMinorPerPointSnapshot: rate,
    idempotencyKey: "ledger:settlement:order-001",
  });

  assert.equal(spent.balanceAfter.held, 0);
  assert.equal(released.balanceAfter.pending, 0);
  assert.equal(released.balanceAfter.redeemable, 450);
  assert.equal(assertBalancedJournal(journal), true);
});

test("virtual gift uses the same cash-value points without enabling user transfers", () => {
  const purchase = purchaseVirtualGift({
    accountId: "wallet-player-1",
    currentBalance: balance({ available: 300 }),
    points: 100,
    twdMinorPerPointSnapshot: rate,
    referenceType: "gift",
    referenceId: "gift-rose-001",
    idempotencyKey: "gift-purchase:001",
    reason: "購買虛擬禮物",
  });
  const earning = creditVirtualGiftEarning({
    accountId: "wallet-provider-1",
    currentBalance: balance(),
    points: 80,
    twdMinorPerPointSnapshot: rate,
    referenceType: "gift",
    referenceId: "gift-rose-001",
    idempotencyKey: "gift-earning:001",
    reason: "虛擬禮物淨收益",
  });
  const journal = createGiftSettlementJournal({
    playerId: "player-1",
    providerId: "provider-1",
    giftId: "gift-rose-001",
    grossPoints: 100,
    providerNetPoints: 80,
    platformFeePoints: 20,
    twdMinorPerPointSnapshot: rate,
    idempotencyKey: "ledger:gift:001",
  });

  assert.equal(purchase.balanceAfter.available, 200);
  assert.equal(earning.balanceAfter.pending, 80);
  assert.equal(assertBalancedJournal(journal), true);
  assert.equal(journal.eventType, "gift_purchase");
});

test("provider can request cash redemption and complete external payout", () => {
  const requested = requestWalletRedemption({
    accountId: "wallet-provider-1",
    currentBalance: balance({ redeemable: 1_000 }),
    points: 600,
    twdMinorPerPointSnapshot: rate,
    referenceType: "redemption",
    referenceId: "redemption-001",
    idempotencyKey: "redemption-request:001",
    reason: "陪玩師申請兌現",
  });
  const paid = completeWalletRedemption({
    accountId: "wallet-provider-1",
    currentBalance: requested.balanceAfter,
    points: 600,
    twdMinorPerPointSnapshot: rate,
    referenceType: "redemption",
    referenceId: "redemption-001",
    idempotencyKey: "redemption-paid:001",
    reason: "外部撥款完成",
  });
  const journal = createRedemptionJournal({
    providerId: "provider-1",
    redemptionId: "redemption-001",
    points: 600,
    twdMinorPerPointSnapshot: rate,
    idempotencyKey: "ledger:redemption:001",
  });

  assert.deepEqual(requested.balanceAfter, balance({ redeemable: 400, frozen: 600 }));
  assert.deepEqual(paid.balanceAfter, balance({ redeemable: 400 }));
  assert.equal(assertBalancedJournal(journal), true);
});

test("penalty appeal creates immutable compensating wallet and ledger entries", () => {
  const original = applyMissedOfferWalletPenalty({
    accountId: "wallet-provider-1",
    currentBalance: balance({ redeemable: 100 }),
    points: 10,
    twdMinorPerPointSnapshot: rate,
    referenceType: "offer",
    referenceId: "offer-appeal",
    idempotencyKey: "penalty:appeal",
    ruleVersion: "missed-offer-v1",
    reason: "逾時扣款",
  });
  const snapshot = structuredClone(original);
  const reversed = reverseWalletCreditEntry(original, {
    originalEntryId: "wallet-entry-penalty",
    currentBalance: original.balanceAfter,
    idempotencyKey: "penalty:appeal:reversal",
    reason: "申訴成立",
  });
  const penaltyJournal = createMissedOfferPenaltyJournal({
    providerId: "provider-1",
    offerId: "offer-appeal",
    points: 10,
    twdMinorPerPointSnapshot: rate,
    idempotencyKey: "ledger:penalty:appeal",
  });
  const reversalJournal = createReversalJournal(penaltyJournal, {
    originalTransactionId: "ledger-penalty-appeal",
    idempotencyKey: "ledger:penalty:appeal:reversal",
    reason: "申訴成立",
  });

  assert.deepEqual(original, snapshot);
  assert.equal(reversed.balanceAfter.redeemable, 100);
  assert.equal(reversed.reversalOfEntryId, "wallet-entry-penalty");
  assert.equal(reversalJournal.postings[0].direction, "credit");
  assert.equal(assertBalancedJournal(reversalJournal), true);
});

test("duplicate events and non-integer point money are rejected", () => {
  assert.throws(
    () =>
      purchaseWalletPoints({
        accountId: "wallet-player-1",
        currentBalance: balance(),
        points: 10,
        twdMinorPerPointSnapshot: rate,
        referenceType: "payment",
        referenceId: "payment-duplicate",
        idempotencyKey: "purchase:duplicate",
        existingIdempotencyKeys: ["purchase:duplicate"],
        reason: "重複測試",
      }),
    /不能重複過帳/
  );
  assert.throws(
    () =>
      purchaseWalletPoints({
        accountId: "wallet-player-1",
        currentBalance: balance(),
        points: 10.5,
        twdMinorPerPointSnapshot: rate,
        referenceType: "payment",
        referenceId: "payment-float",
        idempotencyKey: "purchase:float",
        reason: "浮點測試",
      }),
    /整數/
  );
});
