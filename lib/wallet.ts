export type WalletCreditBucket =
  | "available"
  | "held"
  | "pending"
  | "redeemable"
  | "frozen";

export type WalletCreditBalance = Readonly<Record<WalletCreditBucket, number>>;

export type WalletCreditEventType =
  | "purchase"
  | "order_hold"
  | "order_hold_release"
  | "order_spend"
  | "provider_earning_pending"
  | "provider_earning_release"
  | "missed_offer_penalty"
  | "gift_purchase"
  | "gift_earning"
  | "redemption_requested"
  | "redemption_paid"
  | "dispute_freeze"
  | "dispute_release"
  | "refund"
  | "adjustment"
  | "reversal";

export type WalletCreditEntry = Readonly<{
  accountId: string;
  eventType: WalletCreditEventType;
  pointsAmount: number;
  deltas: WalletCreditBalance;
  balanceAfter: WalletCreditBalance;
  twdValueMinor: number;
  twdMinorPerPointSnapshot: number;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  ruleVersion?: string;
  reason: string;
  reversalOfEntryId?: string;
}>;

export type LedgerDirection = "debit" | "credit";

export type LedgerAccountCode =
  | "processor_clearing"
  | "platform_fee_revenue"
  | "payment_processing_payable"
  | "provider_pending"
  | "provider_available"
  | "provider_frozen"
  | "customer_credit_liability"
  | "provider_credit_liability"
  | "penalty_reserve";

export type LedgerEventType =
  | "point_purchase"
  | "point_hold"
  | "point_hold_release"
  | "point_spend"
  | "point_transfer"
  | "missed_offer_penalty"
  | "gift_purchase"
  | "redemption"
  | "reversal"
  | "adjustment";

export type LedgerPosting = Readonly<{
  ownerKey: string;
  accountCode: LedgerAccountCode;
  direction: LedgerDirection;
  amountMinor: number;
  currency: string;
}>;

export type LedgerJournal = Readonly<{
  eventType: LedgerEventType;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  description: string;
  reversalOfIdempotencyKey?: string;
  postings: readonly LedgerPosting[];
}>;

const bucketNames: WalletCreditBucket[] = [
  "available",
  "held",
  "pending",
  "redeemable",
  "frozen",
];

export function emptyWalletCreditBalance(): WalletCreditBalance {
  return Object.freeze({
    available: 0,
    held: 0,
    pending: 0,
    redeemable: 0,
    frozen: 0,
  });
}

function requiredText(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label}不得為空。`);
  return trimmed;
}

function positiveSafeInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label}必須是大於 0 的整數。`);
  }
  return value;
}

function nonnegativeSafeInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label}必須是大於或等於 0 的整數。`);
  }
  return value;
}

function normalizedCurrency(value: string) {
  const currency = requiredText(value, "幣別").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("幣別必須是三碼英文字母。");
  }
  return currency;
}

function freezeBalance(balance: Record<WalletCreditBucket, number>) {
  return Object.freeze({ ...balance }) as WalletCreditBalance;
}

function validateBalance(balance: WalletCreditBalance, label: string) {
  for (const bucket of bucketNames) {
    nonnegativeSafeInteger(balance[bucket], `${label}${bucket}點數`);
  }
}

function completeDeltas(input: Partial<Record<WalletCreditBucket, number>>) {
  const result = {} as Record<WalletCreditBucket, number>;
  for (const bucket of bucketNames) {
    const value = input[bucket] ?? 0;
    if (!Number.isSafeInteger(value)) {
      throw new Error("點數異動必須是整數。");
    }
    result[bucket] = value;
  }
  return result;
}

export function assertIdempotencyKeyAvailable(
  existingKeys: Iterable<string>,
  requestedKey: string
) {
  const key = requiredText(requestedKey, "冪等鍵");
  if (new Set(existingKeys).has(key)) {
    throw new Error("這個事件已經入帳，不能重複過帳。");
  }
  return key;
}

export function applyWalletCreditEvent(input: {
  accountId: string;
  currentBalance: WalletCreditBalance;
  eventType: WalletCreditEventType;
  pointsAmount: number;
  deltas: Partial<Record<WalletCreditBucket, number>>;
  twdMinorPerPointSnapshot: number;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  existingIdempotencyKeys?: Iterable<string>;
  ruleVersion?: string;
  reason: string;
  reversalOfEntryId?: string;
}) {
  validateBalance(input.currentBalance, "目前");
  const pointsAmount = positiveSafeInteger(input.pointsAmount, "點數");
  const rate = positiveSafeInteger(input.twdMinorPerPointSnapshot, "每點台幣價值");
  const deltas = completeDeltas(input.deltas);
  const absoluteDeltas = bucketNames.map((bucket) => Math.abs(deltas[bucket]));

  if (absoluteDeltas.every((value) => value === 0)) {
    throw new Error("錢包事件至少要有一個點數異動。");
  }
  if (absoluteDeltas.some((value) => value > pointsAmount)) {
    throw new Error("單一餘額異動不得大於事件點數。");
  }
  if (!absoluteDeltas.some((value) => value === pointsAmount)) {
    throw new Error("事件點數必須對應至少一個完整餘額異動。");
  }

  const after = {} as Record<WalletCreditBucket, number>;
  for (const bucket of bucketNames) {
    const next = input.currentBalance[bucket] + deltas[bucket];
    if (!Number.isSafeInteger(next) || next < 0) {
      throw new Error(`${bucket} 點數不足，不能扣成負數。`);
    }
    after[bucket] = next;
  }

  const twdValueMinor = pointsAmount * rate;
  if (!Number.isSafeInteger(twdValueMinor)) {
    throw new Error("點數台幣價值超過可安全計算範圍。");
  }

  const entry: WalletCreditEntry = {
    accountId: requiredText(input.accountId, "錢包帳戶 ID"),
    eventType: input.eventType,
    pointsAmount,
    deltas: freezeBalance(deltas),
    balanceAfter: freezeBalance(after),
    twdValueMinor,
    twdMinorPerPointSnapshot: rate,
    referenceType: requiredText(input.referenceType, "參照類型"),
    referenceId: requiredText(input.referenceId, "參照 ID"),
    idempotencyKey: assertIdempotencyKeyAvailable(
      input.existingIdempotencyKeys ?? [],
      input.idempotencyKey
    ),
    ...(input.ruleVersion
      ? { ruleVersion: requiredText(input.ruleVersion, "規則版本") }
      : {}),
    reason: requiredText(input.reason, "事件原因"),
    ...(input.reversalOfEntryId
      ? { reversalOfEntryId: requiredText(input.reversalOfEntryId, "原事件 ID") }
      : {}),
  };

  return Object.freeze(entry);
}

type WalletEventInput = {
  accountId: string;
  currentBalance: WalletCreditBalance;
  points: number;
  twdMinorPerPointSnapshot: number;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  existingIdempotencyKeys?: Iterable<string>;
  reason: string;
};

export function purchaseWalletPoints(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "purchase",
    pointsAmount: input.points,
    deltas: { available: input.points },
  });
}

export function holdWalletPoints(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "order_hold",
    pointsAmount: input.points,
    deltas: { available: -input.points, held: input.points },
  });
}

export function releaseWalletHold(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "order_hold_release",
    pointsAmount: input.points,
    deltas: { available: input.points, held: -input.points },
  });
}

export function spendHeldWalletPoints(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "order_spend",
    pointsAmount: input.points,
    deltas: { held: -input.points },
  });
}

export function creditProviderPending(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "provider_earning_pending",
    pointsAmount: input.points,
    deltas: { pending: input.points },
  });
}

export function releaseProviderPending(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "provider_earning_release",
    pointsAmount: input.points,
    deltas: { pending: -input.points, redeemable: input.points },
  });
}

export function applyMissedOfferWalletPenalty(
  input: WalletEventInput & { ruleVersion: string }
) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "missed_offer_penalty",
    pointsAmount: input.points,
    deltas: { redeemable: -input.points },
    ruleVersion: requiredText(input.ruleVersion, "逾時扣款規則版本"),
  });
}

export function purchaseVirtualGift(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "gift_purchase",
    pointsAmount: input.points,
    deltas: { available: -input.points },
  });
}

export function creditVirtualGiftEarning(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "gift_earning",
    pointsAmount: input.points,
    deltas: { pending: input.points },
  });
}

export function requestWalletRedemption(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "redemption_requested",
    pointsAmount: input.points,
    deltas: { redeemable: -input.points, frozen: input.points },
  });
}

export function completeWalletRedemption(input: WalletEventInput) {
  return applyWalletCreditEvent({
    ...input,
    eventType: "redemption_paid",
    pointsAmount: input.points,
    deltas: { frozen: -input.points },
  });
}

export function reverseWalletCreditEntry(
  original: WalletCreditEntry,
  input: {
    originalEntryId: string;
    currentBalance: WalletCreditBalance;
    idempotencyKey: string;
    reason: string;
    existingIdempotencyKeys?: Iterable<string>;
  }
) {
  const reverseDeltas = Object.fromEntries(
    bucketNames.map((bucket) => [bucket, -original.deltas[bucket]])
  ) as Record<WalletCreditBucket, number>;

  return applyWalletCreditEvent({
    accountId: original.accountId,
    currentBalance: input.currentBalance,
    eventType: "reversal",
    pointsAmount: original.pointsAmount,
    deltas: reverseDeltas,
    twdMinorPerPointSnapshot: original.twdMinorPerPointSnapshot,
    referenceType: "wallet_credit_entry",
    referenceId: requiredText(input.originalEntryId, "原事件 ID"),
    idempotencyKey: input.idempotencyKey,
    existingIdempotencyKeys: input.existingIdempotencyKeys,
    reason: input.reason,
    reversalOfEntryId: input.originalEntryId,
  });
}

function freezeJournal(journal: LedgerJournal): LedgerJournal {
  const postings = journal.postings.map((posting) => Object.freeze({ ...posting }));
  return Object.freeze({ ...journal, postings: Object.freeze(postings) });
}

export function assertBalancedJournal(journal: LedgerJournal) {
  if (journal.postings.length < 2) {
    throw new Error("一筆帳務交易至少需要兩筆過帳。");
  }

  const totals = new Map<string, { debit: number; credit: number }>();
  for (const posting of journal.postings) {
    positiveSafeInteger(posting.amountMinor, "過帳金額");
    const currency = normalizedCurrency(posting.currency);
    const total = totals.get(currency) ?? { debit: 0, credit: 0 };
    total[posting.direction] += posting.amountMinor;
    if (!Number.isSafeInteger(total[posting.direction])) {
      throw new Error("帳務金額超過可安全計算範圍。");
    }
    totals.set(currency, total);
  }

  for (const [currency, total] of totals) {
    if (total.debit !== total.credit) {
      throw new Error(`${currency} 帳務不平衡：借方與貸方金額不同。`);
    }
  }
  return true;
}

function pointValueMinor(points: number, rate: number) {
  const value = positiveSafeInteger(points, "點數") * positiveSafeInteger(rate, "每點台幣價值");
  if (!Number.isSafeInteger(value)) throw new Error("點數台幣價值超過可安全計算範圍。");
  return value;
}

function createJournal(input: Omit<LedgerJournal, "postings"> & { postings: LedgerPosting[] }) {
  const journal = freezeJournal(input);
  assertBalancedJournal(journal);
  return journal;
}

export function createPointPurchaseJournal(input: {
  playerId: string;
  points: number;
  twdMinorPerPointSnapshot: number;
  paymentId: string;
  idempotencyKey: string;
}) {
  const amountMinor = pointValueMinor(input.points, input.twdMinorPerPointSnapshot);
  return createJournal({
    eventType: "point_purchase",
    referenceType: "payment",
    referenceId: requiredText(input.paymentId, "付款 ID"),
    idempotencyKey: requiredText(input.idempotencyKey, "冪等鍵"),
    description: "玩家以台幣購買點數",
    postings: [
      {
        ownerKey: "payment_processor:default",
        accountCode: "processor_clearing",
        direction: "debit",
        amountMinor,
        currency: "TWD",
      },
      {
        ownerKey: `player:${requiredText(input.playerId, "玩家 ID")}`,
        accountCode: "customer_credit_liability",
        direction: "credit",
        amountMinor,
        currency: "TWD",
      },
    ],
  });
}

export function createServiceSettlementJournal(input: {
  playerId: string;
  providerId: string;
  orderId: string;
  grossPoints: number;
  providerNetPoints: number;
  platformFeePoints: number;
  twdMinorPerPointSnapshot: number;
  idempotencyKey: string;
}) {
  const grossPoints = positiveSafeInteger(input.grossPoints, "訂單點數");
  const providerPoints = positiveSafeInteger(input.providerNetPoints, "陪玩師淨點數");
  const feePoints = nonnegativeSafeInteger(input.platformFeePoints, "平台費點數");
  if (grossPoints !== providerPoints + feePoints) {
    throw new Error("訂單點數不等於陪玩師淨點數與平台費總和。");
  }
  const rate = positiveSafeInteger(input.twdMinorPerPointSnapshot, "每點台幣價值");
  const postings: LedgerPosting[] = [
    {
      ownerKey: `player:${requiredText(input.playerId, "玩家 ID")}`,
      accountCode: "customer_credit_liability",
      direction: "debit",
      amountMinor: pointValueMinor(grossPoints, rate),
      currency: "TWD",
    },
    {
      ownerKey: `provider:${requiredText(input.providerId, "陪玩師 ID")}`,
      accountCode: "provider_credit_liability",
      direction: "credit",
      amountMinor: pointValueMinor(providerPoints, rate),
      currency: "TWD",
    },
  ];
  if (feePoints > 0) {
    postings.push({
      ownerKey: "platform",
      accountCode: "platform_fee_revenue",
      direction: "credit",
      amountMinor: pointValueMinor(feePoints, rate),
      currency: "TWD",
    });
  }
  return createJournal({
    eventType: "point_transfer",
    referenceType: "order",
    referenceId: requiredText(input.orderId, "訂單 ID"),
    idempotencyKey: requiredText(input.idempotencyKey, "冪等鍵"),
    description: "服務完成後轉移點數價值",
    postings,
  });
}

export function createMissedOfferPenaltyJournal(input: {
  providerId: string;
  offerId: string;
  points: number;
  twdMinorPerPointSnapshot: number;
  idempotencyKey: string;
}) {
  const amountMinor = pointValueMinor(input.points, input.twdMinorPerPointSnapshot);
  return createJournal({
    eventType: "missed_offer_penalty",
    referenceType: "offer",
    referenceId: requiredText(input.offerId, "邀請 ID"),
    idempotencyKey: requiredText(input.idempotencyKey, "冪等鍵"),
    description: "陪玩師一分鐘內未接受邀請的錢包扣款",
    postings: [
      {
        ownerKey: `provider:${requiredText(input.providerId, "陪玩師 ID")}`,
        accountCode: "provider_credit_liability",
        direction: "debit",
        amountMinor,
        currency: "TWD",
      },
      {
        ownerKey: "platform",
        accountCode: "penalty_reserve",
        direction: "credit",
        amountMinor,
        currency: "TWD",
      },
    ],
  });
}

export function createGiftSettlementJournal(input: {
  playerId: string;
  providerId: string;
  giftId: string;
  grossPoints: number;
  providerNetPoints: number;
  platformFeePoints: number;
  twdMinorPerPointSnapshot: number;
  idempotencyKey: string;
}) {
  const journal = createServiceSettlementJournal({
    playerId: input.playerId,
    providerId: input.providerId,
    orderId: input.giftId,
    grossPoints: input.grossPoints,
    providerNetPoints: input.providerNetPoints,
    platformFeePoints: input.platformFeePoints,
    twdMinorPerPointSnapshot: input.twdMinorPerPointSnapshot,
    idempotencyKey: input.idempotencyKey,
  });
  return freezeJournal({
    ...journal,
    eventType: "gift_purchase",
    referenceType: "gift",
    description: "虛擬禮物點數價值轉移",
  });
}

export function createRedemptionJournal(input: {
  providerId: string;
  redemptionId: string;
  points: number;
  twdMinorPerPointSnapshot: number;
  idempotencyKey: string;
}) {
  const amountMinor = pointValueMinor(input.points, input.twdMinorPerPointSnapshot);
  return createJournal({
    eventType: "redemption",
    referenceType: "redemption",
    referenceId: requiredText(input.redemptionId, "兌現 ID"),
    idempotencyKey: requiredText(input.idempotencyKey, "冪等鍵"),
    description: "陪玩師點數兌換台幣",
    postings: [
      {
        ownerKey: `provider:${requiredText(input.providerId, "陪玩師 ID")}`,
        accountCode: "provider_credit_liability",
        direction: "debit",
        amountMinor,
        currency: "TWD",
      },
      {
        ownerKey: "payment_processor:default",
        accountCode: "processor_clearing",
        direction: "credit",
        amountMinor,
        currency: "TWD",
      },
    ],
  });
}

export function createReversalJournal(
  original: LedgerJournal,
  input: { originalTransactionId: string; idempotencyKey: string; reason: string }
) {
  assertBalancedJournal(original);
  return createJournal({
    eventType: "reversal",
    referenceType: "ledger_transaction",
    referenceId: requiredText(input.originalTransactionId, "原交易 ID"),
    idempotencyKey: requiredText(input.idempotencyKey, "冪等鍵"),
    reversalOfIdempotencyKey: original.idempotencyKey,
    description: requiredText(input.reason, "沖正原因"),
    postings: original.postings.map((posting) => ({
      ...posting,
      direction: posting.direction === "debit" ? "credit" : "debit",
    })),
  });
}
