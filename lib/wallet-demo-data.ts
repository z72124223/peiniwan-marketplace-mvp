export const walletDemoProfile = {
  displayName: "小安",
  providerId: "provider_xiao_an",
  currency: "TWD",
  availableMinor: 104_000,
  pendingMinor: 59_700,
  frozenMinor: 29_900,
  paidMinor: 238_000,
  reliabilityPoints: 95,
  reliabilityMaximum: 100,
} as const;

export const walletDemoMoneyEntries = [
  {
    id: "demo-money-1",
    date: "7 月 17 日・22:10",
    title: "英雄聯盟・60 分鐘",
    note: "服務完成，等待訂單確認",
    status: "pending",
    statusLabel: "待入帳",
    amountMinor: 59_700,
  },
  {
    id: "demo-money-2",
    date: "7 月 16 日・23:42",
    title: "特戰英豪・90 分鐘",
    note: "等待期結束，可進入撥款流程",
    status: "available",
    statusLabel: "可提領",
    amountMinor: 104_000,
  },
  {
    id: "demo-money-3",
    date: "7 月 15 日・21:06",
    title: "訂單 D-018",
    note: "有爭議待人工確認，收益沒有被扣除",
    status: "frozen",
    statusLabel: "爭議凍結",
    amountMinor: 29_900,
  },
  {
    id: "demo-money-4",
    date: "7 月 12 日・15:30",
    title: "示範撥款批次 P-0712",
    note: "外部撥款確認後才會列在這裡",
    status: "paid",
    statusLabel: "已撥款",
    amountMinor: 238_000,
  },
] as const;

export const walletDemoPointEntries = [
  {
    id: "demo-points-1",
    date: "7 月 17 日・20:41",
    title: "沒有在 1 分鐘內接受邀請",
    note: "示範結果：自動下線；實際扣點值尚未定案",
    deltaPoints: -5,
  },
  {
    id: "demo-points-2",
    date: "帳戶建立",
    title: "可靠度起始點數",
    note: "示範起始值，正式規則仍需人工確認",
    deltaPoints: 100,
  },
] as const;
