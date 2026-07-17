export type LedgerDirection = "debit" | "credit";

export type LedgerAccountCode =
  | "processor_clearing"
  | "platform_fee_revenue"
  | "payment_processing_payable"
  | "provider_pending"
  | "provider_available"
  | "provider_frozen";

export type LedgerEventType =
  | "settlement"
  | "release"
  | "freeze"
  | "unfreeze"
  | "payout"
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

export type PointEntryReason =
  | "opening_balance"
  | "missed_offer"
  | "completed_order"
  | "manual_adjustment"
  | "reversal";

export type PointEntry = Readonly<{
  accountId: string;
  deltaPoints: number;
  balanceAfterPoints: number;
  reason: PointEntryReason;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  reversalOfEntryId?: string;
}>;

type TransferJournalInput = {
  providerId: string;
  amountMinor: number;
  currency: string;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  description: string;
};

function requiredText(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label}不得為空。`);
  return trimmed;
}

function normalizedCurrency(value: string) {
  const currency = requiredText(value, "幣別").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("幣別必須是三碼英文字母。");
  }
  return currency;
}

function positiveMinorUnits(value: number, label = "金額") {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label}必須是大於 0 的最小貨幣單位整數。`);
  }
  return value;
}

function nonnegativeMinorUnits(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label}必須是大於或等於 0 的最小貨幣單位整數。`);
  }
  return value;
}

function providerOwnerKey(providerId: string) {
  return `provider:${requiredText(providerId, "陪玩師 ID")}`;
}

function freezeJournal(journal: LedgerJournal): LedgerJournal {
  const postings = journal.postings.map((posting) => Object.freeze({ ...posting }));
  return Object.freeze({ ...journal, postings: Object.freeze(postings) });
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

export function assertBalancedJournal(journal: LedgerJournal) {
  if (journal.postings.length < 2) {
    throw new Error("一筆帳務交易至少需要兩筆過帳。");
  }

  const totals = new Map<string, { debit: number; credit: number }>();
  for (const posting of journal.postings) {
    positiveMinorUnits(posting.amountMinor);
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

export function createSettlementJournal(input: {
  orderId: string;
  providerId: string;
  currency: string;
  grossAmountMinor: number;
  platformFeeAmountMinor: number;
  paymentProcessingFeeMinor: number;
  providerNetAmountMinor: number;
  idempotencyKey: string;
}) {
  const currency = normalizedCurrency(input.currency);
  const gross = positiveMinorUnits(input.grossAmountMinor, "訂單總額");
  const platformFee = nonnegativeMinorUnits(input.platformFeeAmountMinor, "平台費");
  const processingFee = nonnegativeMinorUnits(
    input.paymentProcessingFeeMinor,
    "金流處理費"
  );
  const providerNet = positiveMinorUnits(input.providerNetAmountMinor, "陪玩師淨額");

  if (gross !== platformFee + processingFee + providerNet) {
    throw new Error("訂單總額不等於平台費、金流處理費與陪玩師淨額總和。");
  }

  const postings: LedgerPosting[] = [
    {
      ownerKey: "payment_processor:default",
      accountCode: "processor_clearing",
      direction: "debit",
      amountMinor: gross,
      currency,
    },
  ];

  if (platformFee > 0) {
    postings.push({
      ownerKey: "platform",
      accountCode: "platform_fee_revenue",
      direction: "credit",
      amountMinor: platformFee,
      currency,
    });
  }
  if (processingFee > 0) {
    postings.push({
      ownerKey: "platform",
      accountCode: "payment_processing_payable",
      direction: "credit",
      amountMinor: processingFee,
      currency,
    });
  }
  postings.push({
    ownerKey: providerOwnerKey(input.providerId),
    accountCode: "provider_pending",
    direction: "credit",
    amountMinor: providerNet,
    currency,
  });

  const journal = freezeJournal({
    eventType: "settlement",
    referenceType: "order",
    referenceId: requiredText(input.orderId, "訂單 ID"),
    idempotencyKey: requiredText(input.idempotencyKey, "冪等鍵"),
    description: "訂單收益進入待入帳",
    postings,
  });
  assertBalancedJournal(journal);
  return journal;
}

function createTransferJournal(
  input: TransferJournalInput,
  eventType: Exclude<LedgerEventType, "settlement" | "reversal" | "adjustment">,
  fromAccount: LedgerAccountCode,
  toAccount: LedgerAccountCode,
  toOwnerKey = providerOwnerKey(input.providerId)
) {
  const currency = normalizedCurrency(input.currency);
  const amountMinor = positiveMinorUnits(input.amountMinor);
  const ownerKey = providerOwnerKey(input.providerId);
  const journal = freezeJournal({
    eventType,
    referenceType: requiredText(input.referenceType, "參照類型"),
    referenceId: requiredText(input.referenceId, "參照 ID"),
    idempotencyKey: requiredText(input.idempotencyKey, "冪等鍵"),
    description: requiredText(input.description, "交易說明"),
    postings: [
      { ownerKey, accountCode: fromAccount, direction: "debit", amountMinor, currency },
      {
        ownerKey: toOwnerKey,
        accountCode: toAccount,
        direction: "credit",
        amountMinor,
        currency,
      },
    ],
  });
  assertBalancedJournal(journal);
  return journal;
}

export function createReleaseJournal(input: TransferJournalInput) {
  return createTransferJournal(input, "release", "provider_pending", "provider_available");
}

export function createFreezeJournal(input: TransferJournalInput) {
  return createTransferJournal(input, "freeze", "provider_available", "provider_frozen");
}

export function createUnfreezeJournal(input: TransferJournalInput) {
  return createTransferJournal(input, "unfreeze", "provider_frozen", "provider_available");
}

export function createPayoutJournal(input: TransferJournalInput) {
  return createTransferJournal(
    input,
    "payout",
    "provider_available",
    "processor_clearing",
    "payment_processor:default"
  );
}

export function createReversalJournal(
  original: LedgerJournal,
  input: {
    referenceId: string;
    idempotencyKey: string;
    description: string;
  }
) {
  assertBalancedJournal(original);
  const journal = freezeJournal({
    eventType: "reversal",
    referenceType: "ledger_transaction",
    referenceId: requiredText(input.referenceId, "原交易 ID"),
    idempotencyKey: requiredText(input.idempotencyKey, "冪等鍵"),
    reversalOfIdempotencyKey: original.idempotencyKey,
    description: requiredText(input.description, "沖正原因"),
    postings: original.postings.map((posting) => ({
      ...posting,
      direction: posting.direction === "debit" ? "credit" : "debit",
    })),
  });
  assertBalancedJournal(journal);
  return journal;
}

export function applyPointEntry(input: {
  accountId: string;
  currentBalancePoints: number;
  deltaPoints: number;
  reason: PointEntryReason;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  existingIdempotencyKeys?: Iterable<string>;
  reversalOfEntryId?: string;
}) {
  if (!Number.isSafeInteger(input.currentBalancePoints) || input.currentBalancePoints < 0) {
    throw new Error("目前可靠度點數必須是大於或等於 0 的整數。");
  }
  if (!Number.isSafeInteger(input.deltaPoints) || input.deltaPoints === 0) {
    throw new Error("可靠度點數異動必須是非 0 整數。");
  }

  const idempotencyKey = assertIdempotencyKeyAvailable(
    input.existingIdempotencyKeys ?? [],
    input.idempotencyKey
  );
  const balanceAfterPoints = input.currentBalancePoints + input.deltaPoints;
  if (!Number.isSafeInteger(balanceAfterPoints) || balanceAfterPoints < 0) {
    throw new Error("可靠度點數不足，不能過帳成負數。");
  }

  return Object.freeze({
    accountId: requiredText(input.accountId, "點數帳戶 ID"),
    deltaPoints: input.deltaPoints,
    balanceAfterPoints,
    reason: input.reason,
    referenceType: requiredText(input.referenceType, "參照類型"),
    referenceId: requiredText(input.referenceId, "參照 ID"),
    idempotencyKey,
    ...(input.reversalOfEntryId
      ? { reversalOfEntryId: requiredText(input.reversalOfEntryId, "原點數紀錄 ID") }
      : {}),
  }) satisfies PointEntry;
}

export function reversePointEntry(
  originalEntry: PointEntry,
  input: {
    originalEntryId: string;
    currentBalancePoints: number;
    idempotencyKey: string;
    existingIdempotencyKeys?: Iterable<string>;
  }
) {
  return applyPointEntry({
    accountId: originalEntry.accountId,
    currentBalancePoints: input.currentBalancePoints,
    deltaPoints: -originalEntry.deltaPoints,
    reason: "reversal",
    referenceType: "provider_point_entry",
    referenceId: requiredText(input.originalEntryId, "原點數紀錄 ID"),
    idempotencyKey: input.idempotencyKey,
    existingIdempotencyKeys: input.existingIdempotencyKeys,
    reversalOfEntryId: input.originalEntryId,
  });
}
