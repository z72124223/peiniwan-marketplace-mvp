export type OwnerQueueKind = "applications" | "concierge" | "support";

export interface OwnerQueueItem {
  id: string;
  kind: OwnerQueueKind;
  title: string;
  detail: string;
  status: string;
  risk?: "一般" | "中" | "高";
}

export interface OwnerAuditEntry {
  id: string;
  at: string;
  action: string;
  entityId: string;
  previousStatus: string;
  nextStatus: string;
  reason: string;
}

const allowedTransitions: Record<OwnerQueueKind, Record<string, string[]>> = {
  applications: {
    待審核: ["需補件", "已通過", "已拒絕"],
    需補件: ["待審核", "已通過", "已拒絕"],
    已通過: ["已停權"],
    已停權: ["已通過"],
    已拒絕: [],
  },
  concierge: {
    新需求: ["媒合中", "已關閉"],
    媒合中: ["已媒合", "已關閉"],
    已媒合: ["已完成", "需協助"],
    需協助: ["已完成", "已關閉"],
    已完成: [],
    已關閉: [],
  },
  support: {
    待回覆: ["調查中", "已解決"],
    調查中: ["退款評估", "已解決", "已升級"],
    退款評估: ["已解決", "已升級"],
    已升級: ["已解決"],
    已解決: [],
  },
};

export function nextOwnerStatuses(item: OwnerQueueItem) {
  return allowedTransitions[item.kind][item.status] ?? [];
}

export function applyOwnerTransition(
  items: OwnerQueueItem[],
  entityId: string,
  nextStatus: string,
  reason: string,
  now = new Date()
): { items: OwnerQueueItem[]; audit: OwnerAuditEntry } {
  const item = items.find((candidate) => candidate.id === entityId);
  if (!item) throw new Error("找不到營運項目。");
  if (!nextOwnerStatuses(item).includes(nextStatus)) {
    throw new Error(`不允許從「${item.status}」切換到「${nextStatus}」。`);
  }

  const cleanReason = reason.trim();
  if (!cleanReason) throw new Error("人工決策必須留下原因。");

  return {
    items: items.map((candidate) =>
      candidate.id === entityId ? { ...candidate, status: nextStatus } : candidate
    ),
    audit: {
      id: `audit_${entityId}_${now.getTime()}`,
      at: now.toLocaleString("zh-TW", { hour12: false }),
      action: `${item.kind}.status_changed`,
      entityId,
      previousStatus: item.status,
      nextStatus,
      reason: cleanReason,
    },
  };
}
