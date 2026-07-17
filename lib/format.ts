import type { BillingUnit, ServiceAxis } from "./seed-data";

export function formatPrice(amountMinor: number, currency: string) {
  const value = amountMinor / 100;
  if (currency === "TWD") return `NT$${value.toLocaleString("zh-TW")}`;
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency }).format(value);
}

export function billingUnitLabel(unit: BillingUnit) {
  return {
    per_game: "場",
    per_30_minutes: "30 分鐘",
    per_60_minutes: "60 分鐘",
    package: "套餐",
  }[unit];
}

export function serviceAxisLabel(axis: ServiceAxis) {
  return {
    emotional: "娛樂／情緒",
    technical: "技術",
    hybrid: "全能",
  }[axis];
}
