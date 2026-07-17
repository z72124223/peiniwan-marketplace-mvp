import assert from "node:assert/strict";
import { test } from "node:test";
import { applyOwnerTransition, nextOwnerStatuses, type OwnerQueueItem } from "../lib/owner-ops";

const item: OwnerQueueItem = {
  id: "app_test",
  kind: "applications",
  title: "測試申請",
  detail: "待審核",
  status: "待審核",
};

test("Owner 可執行允許的人工狀態轉換並產生稽核", () => {
  const now = new Date("2026-07-17T08:00:00.000Z");
  const result = applyOwnerTransition([item], item.id, "已通過", "照片、語音與技能皆已人工確認", now);
  assert.equal(result.items[0].status, "已通過");
  assert.equal(result.audit.previousStatus, "待審核");
  assert.equal(result.audit.nextStatus, "已通過");
  assert.equal(result.audit.reason, "照片、語音與技能皆已人工確認");
});

test("Owner 不可跳過定義的狀態轉換", () => {
  assert.throws(
    () => applyOwnerTransition([item], item.id, "已停權", "測試"),
    /不允許/
  );
});

test("Owner 決策不可缺少理由", () => {
  assert.throws(
    () => applyOwnerTransition([item], item.id, "需補件", "   "),
    /必須留下原因/
  );
});

test("終態不再提供下一步操作", () => {
  assert.deepEqual(nextOwnerStatuses({ ...item, status: "已拒絕" }), []);
});
