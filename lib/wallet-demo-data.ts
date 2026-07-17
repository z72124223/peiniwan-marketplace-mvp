export const walletDemoExchange = {
  points: 1,
  twdMinor: 100,
  label: "示範匯率：1 點 = NT$1",
} as const;

export const walletDemoPlayer = {
  displayName: "玩家阿凱",
  availablePoints: 1_250,
  heldPoints: 299,
  lifetimePurchasedPoints: 3_000,
} as const;

export const walletDemoProvider = {
  displayName: "小安",
  pendingPoints: 597,
  redeemablePoints: 1_040,
  frozenPoints: 299,
  lifetimeRedeemedPoints: 2_380,
} as const;

export const walletDemoPlayerEntries = [
  {
    id: "player-entry-1",
    date: "7 月 18 日・20:42",
    title: "選擇陪玩師・先保留",
    note: "等待對方在 1 分鐘內接受；尚未完成消費",
    status: "held",
    statusLabel: "已保留",
    deltaPoints: -299,
  },
  {
    id: "player-entry-2",
    date: "7 月 18 日・19:18",
    title: "台幣購買點數",
    note: "示範付款 NT$1,000，依當時匯率加入錢包",
    status: "purchase",
    statusLabel: "買點",
    deltaPoints: 1_000,
  },
  {
    id: "player-entry-3",
    date: "7 月 17 日・23:01",
    title: "邀請逾時・點數返還",
    note: "陪玩師未接受，玩家保留的點數全數退回",
    status: "released",
    statusLabel: "已返還",
    deltaPoints: 399,
  },
] as const;

export const walletDemoProviderEntries = [
  {
    id: "provider-entry-1",
    date: "7 月 18 日・20:43",
    title: "1 分鐘內未接受邀請",
    note: "自動下線，依 missed-offer-v1 示範規則直接扣錢包",
    status: "penalty",
    statusLabel: "逾時扣款",
    deltaPoints: -10,
  },
  {
    id: "provider-entry-2",
    date: "7 月 17 日・22:10",
    title: "英雄聯盟・60 分鐘",
    note: "服務完成，等待訂單確認後才能兌現",
    status: "pending",
    statusLabel: "待入帳",
    deltaPoints: 597,
  },
  {
    id: "provider-entry-3",
    date: "7 月 16 日・23:42",
    title: "特戰英豪・90 分鐘",
    note: "等待期結束，收益已成為可兌現點數",
    status: "redeemable",
    statusLabel: "可兌現",
    deltaPoints: 1_040,
  },
] as const;
