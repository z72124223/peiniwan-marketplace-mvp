"use client";

import { useMemo, useState } from "react";
import {
  applyOwnerTransition,
  nextOwnerStatuses,
  type OwnerAuditEntry,
  type OwnerQueueItem,
  type OwnerQueueKind,
} from "@/lib/owner-ops";

const startingItems: OwnerQueueItem[] = [
  { id: "app_001", kind: "applications", title: "Mina", detail: "今天 16:20・情緒陪伴／複合型・語音待聽", status: "待審核" },
  { id: "app_002", kind: "applications", title: "周周", detail: "今天 14:05・技術陪玩・缺少清楚語音", status: "需補件" },
  { id: "app_003", kind: "applications", title: "Rex", detail: "昨天 22:48・戰術教學・戰績待驗", status: "待審核" },
  { id: "match_001", kind: "concierge", title: "今晚 21:30｜特戰英豪", detail: "想認真上分・預算 NT$600–900・偏好冷靜報點", status: "新需求" },
  { id: "match_002", kind: "concierge", title: "週六 20:00｜英雄聯盟", detail: "怕尷尬的新手・預算 NT$300–600・希望主動開話題", status: "媒合中" },
  { id: "case_001", kind: "support", title: "訂單時間需要改期", detail: "雙方尚未開始服務，可協調新時段", status: "待回覆", risk: "一般" },
  { id: "case_002", kind: "support", title: "服務描述與實際不符", detail: "玩家已提供對話截圖，需向陪玩師取證", status: "調查中", risk: "中" },
];

const tabs: { id: OwnerQueueKind; label: string }[] = [
  { id: "applications", label: "陪玩師審核" },
  { id: "concierge", label: "人工派單" },
  { id: "support", label: "客服與爭議" },
];

export function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<OwnerQueueKind>("applications");
  const [items, setItems] = useState(startingItems);
  const [audits, setAudits] = useState<OwnerAuditEntry[]>([]);
  const [ownerOnline, setOwnerOnline] = useState(true);
  const [notice, setNotice] = useState("這是私密營運預覽；狀態操作只保留在目前畫面，不會寫入正式後台。");

  const activeItems = useMemo(
    () => items.filter((item) => item.kind === activeTab),
    [activeTab, items]
  );

  function transition(item: OwnerQueueItem, nextStatus: string) {
    const reason = `Owner 在私密預覽中人工判斷：${item.title} → ${nextStatus}`;
    try {
      const result = applyOwnerTransition(items, item.id, nextStatus, reason);
      setItems(result.items);
      setAudits((current) => [result.audit, ...current].slice(0, 8));
      setNotice(`已將「${item.title}」更新為「${nextStatus}」，並建立畫面內稽核紀錄。`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "狀態更新失敗。");
    }
  }

  const openApplications = items.filter((item) => item.kind === "applications" && !["已通過", "已拒絕"].includes(item.status)).length;
  const openMatches = items.filter((item) => item.kind === "concierge" && !["已完成", "已關閉"].includes(item.status)).length;
  const openCases = items.filter((item) => item.kind === "support" && item.status !== "已解決").length;

  return (
    <div className="owner-dashboard">
      <section className="owner-security-banner">
        <div>
          <span className="eyebrow">PRIVATE MVP・非正式營運後台</span>
          <strong>正式身份驗證與 Owner allowlist 尚未啟用</strong>
          <p>本頁只示範 Owner 工作流。正式上線前，必須接上登入、角色授權及伺服器端稽核。</p>
        </div>
        <button className={ownerOnline ? "owner-status is-online" : "owner-status"} type="button" onClick={() => setOwnerOnline((value) => !value)}>
          <i /> {ownerOnline ? "站長在線" : "站長離線"}
        </button>
      </section>

      <section className="owner-kpi-grid" aria-label="營運摘要">
        <article><span>待處理申請</span><strong>{openApplications}</strong><small>逐筆人工驗證照片、語音與技能證明</small></article>
        <article><span>媒合中需求</span><strong>{openMatches}</strong><small>本人依遊戲、時段、預算與偏好安排</small></article>
        <article><span>未結客服</span><strong>{openCases}</strong><small>退款、爭議、停權都必須留下理由</small></article>
        <article className="owner-kpi-accent"><span>自動封禁</span><strong>0</strong><small>第一版所有高風險決策皆由 Owner 人工處理</small></article>
      </section>

      <section className="owner-workspace">
        <div className="owner-main-panel">
          <div className="owner-tabs" role="tablist" aria-label="Owner 工作佇列">
            {tabs.map((tab) => (
              <button key={tab.id} className={activeTab === tab.id ? "is-active" : ""} type="button" onClick={() => setActiveTab(tab.id)}>
                {tab.label}<span>{items.filter((item) => item.kind === tab.id).length}</span>
              </button>
            ))}
          </div>

          <div className="owner-notice" role="status">{notice}</div>

          <div className="owner-queue">
            {activeItems.map((item) => {
              const nextStatuses = nextOwnerStatuses(item);
              return (
                <article className="owner-queue-card" key={item.id}>
                  <div className="owner-queue-copy">
                    <div className="owner-queue-meta"><code>{item.id}</code>{item.risk && <span className={`risk risk-${item.risk}`}>風險：{item.risk}</span>}</div>
                    <h2>{item.title}</h2>
                    <p>{item.detail}</p>
                  </div>
                  <div className="owner-queue-actions">
                    <span className="status-pill">{item.status}</span>
                    <div>
                      {nextStatuses.map((status, index) => (
                        <button className={index === 0 ? "button button-primary button-small" : "button button-quiet button-small"} key={status} type="button" onClick={() => transition(item, status)}>
                          {status}
                        </button>
                      ))}
                      {nextStatuses.length === 0 && <small>此項目已結案</small>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="owner-audit-panel">
          <span className="eyebrow">AUDIT TRAIL・稽核軌跡</span>
          <h2>人工決策紀錄</h2>
          <p>任何通過、拒絕、退款、停權與解封，都要記錄前後狀態與原因。</p>
          <div className="owner-audit-list">
            {audits.length === 0 ? (
              <div className="owner-empty-audit">操作任一狀態後，紀錄會出現在這裡。</div>
            ) : audits.map((audit) => (
              <article key={audit.id}>
                <span>{audit.at}</span>
                <strong>{audit.previousStatus} → {audit.nextStatus}</strong>
                <small>{audit.entityId}・{audit.reason}</small>
              </article>
            ))}
          </div>
          <div className="owner-boundary-list">
            <h3>正式上線前的安全閘門</h3>
            <ul>
              <li>Owner allowlist 與多因素登入</li>
              <li>伺服器端授權與不可竄改稽核</li>
              <li>個資遮罩、證據保留期與刪除流程</li>
              <li>退款、停權與申訴的雙重確認</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
