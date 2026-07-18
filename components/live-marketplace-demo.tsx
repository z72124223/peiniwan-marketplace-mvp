"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  LiveMarketplaceSnapshot,
  LiveProviderView,
} from "@/lib/live-marketplace-store";

type LiveAction =
  | { action: "clock_in" | "clock_out"; providerId: string }
  | {
      action: "invite";
      providerId: string;
      providerServiceId: string;
    }
  | { action: "accept" | "decline" | "expire"; invitationId: string };

const statusLabels = {
  online: "在線可接單",
  busy: "處理邀請中",
  offline: "目前離線",
} as const;

const invitationLabels = {
  pending: "等待回覆",
  accepted: "已接受・訂單成立",
  declined: "已拒絕・點數返還",
  expired: "已逾時・點數返還",
  cancelled: "已取消",
} as const;

function providerStatus(provider: LiveProviderView) {
  return statusLabels[provider.status];
}

export function LiveMarketplaceDemo() {
  const [snapshot, setSnapshot] = useState<LiveMarketplaceSnapshot | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState("正在讀取私人 Demo 狀態…");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const expiringIds = useRef(new Set<string>());

  const loadSnapshot = useCallback(async () => {
    const response = await fetch("/api/live-marketplace", { cache: "no-store" });
    const body = (await response.json()) as LiveMarketplaceSnapshot & {
      error?: string;
    };
    if (!response.ok) {
      throw new Error(body.error ?? "目前無法讀取即時狀態。");
    }
    setSnapshot(body);
    setNotice("狀態已與 D1 同步");
  }, []);

  const runAction = useCallback(async (payload: LiveAction, key: string) => {
    setBusyKey(key);
    setError("");
    try {
      const response = await fetch("/api/live-marketplace", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as LiveMarketplaceSnapshot & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(body.error ?? "操作沒有完成，請重新整理後再試。");
      }
      setSnapshot(body);
      setNotice("操作已保存，重新整理也不會遺失");
      return body;
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "操作沒有完成。"
      );
      return null;
    } finally {
      setBusyKey(null);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      loadSnapshot().catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "讀取失敗。")
      );
    }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadSnapshot]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    const refresh = window.setInterval(() => {
      loadSnapshot().catch(() => undefined);
    }, 10_000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(refresh);
    };
  }, [loadSnapshot]);

  const pendingInvitation = useMemo(
    () => snapshot?.invitations.find((item) => item.status === "pending") ?? null,
    [snapshot]
  );
  const secondsRemaining = pendingInvitation
    ? Math.max(
        0,
        Math.ceil((new Date(pendingInvitation.expiresAt).getTime() - now) / 1_000)
      )
    : 0;

  useEffect(() => {
    if (
      !pendingInvitation ||
      secondsRemaining > 0 ||
      expiringIds.current.has(pendingInvitation.id)
    ) {
      return;
    }
    expiringIds.current.add(pendingInvitation.id);
    runAction(
      { action: "expire", invitationId: pendingInvitation.id },
      `expire:${pendingInvitation.id}`
    ).finally(() => expiringIds.current.delete(pendingInvitation.id));
  }, [pendingInvitation, runAction, secondsRemaining]);

  const onlineProviders =
    snapshot?.providers.filter((provider) => provider.status === "online") ?? [];

  if (!snapshot) {
    return (
      <div className="live-loading" role="status">
        <span className="live-pulse" aria-hidden />
        <p>{error || notice}</p>
        {error ? (
          <button className="button button-small button-dark" onClick={() => loadSnapshot()} type="button">
            重新讀取
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="live-demo-shell">
      <section className="live-demo-banner" aria-label="私人 Demo 邊界">
        <div>
          <span>PRIVATE DEMO</span>
          <strong>這是角色操作模擬，不是正式登入。</strong>
        </div>
        <p>資料會保存到 D1；沒有接收真實台幣，也不會執行未核定的陪玩師扣點。</p>
      </section>

      <section className="live-wallet-strip" aria-label="Demo 玩家錢包">
        <div>
          <span>Demo 玩家・小葵</span>
          <strong>{snapshot.player.availablePoints.toLocaleString()} 點可用</strong>
        </div>
        <div>
          <span>邀請保留中</span>
          <strong>{snapshot.player.heldPoints.toLocaleString()} 點</strong>
        </div>
        <p>{error || notice}</p>
      </section>

      <div className="live-dashboard-grid">
        <section className="live-panel live-player-panel">
          <div className="live-panel-heading">
            <div>
              <span>PLAYER VIEW</span>
              <h2>在線陪玩師</h2>
            </div>
            <strong>{onlineProviders.length} 位可選</strong>
          </div>

          {onlineProviders.length ? (
            <div className="live-provider-list">
              {onlineProviders.map((provider) => (
                <article className="live-provider-card" key={provider.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={provider.photoUrl} alt={`${provider.displayName}的示範照片`} />
                  <div>
                    <span className="live-status is-online">
                      <i aria-hidden />在線可接單
                    </span>
                    <h3>{provider.displayName}</h3>
                    <p>{provider.serviceTitle}</p>
                    <div className="live-card-footer">
                      <strong>{provider.points} 點</strong>
                      <button
                        className="button button-small button-primary"
                        disabled={Boolean(pendingInvitation) || busyKey !== null}
                        onClick={() =>
                          runAction(
                            {
                              action: "invite",
                              providerId: provider.id,
                              providerServiceId: provider.serviceId,
                            },
                            `invite:${provider.id}`
                          )
                        }
                        type="button"
                      >
                        {busyKey === `invite:${provider.id}`
                          ? "送出中…"
                          : "選擇並邀請"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="live-empty-state">
              <span>目前在線池是空的</span>
              <h3>先在右側替一位陪玩師打卡。</h3>
              <p>只有完成打卡且沒有其他邀請的人，才會出現在玩家畫面。</p>
            </div>
          )}
        </section>

        <section className="live-panel live-provider-panel">
          <div className="live-panel-heading">
            <div>
              <span>PROVIDER VIEW</span>
              <h2>陪玩師打卡台</h2>
            </div>
            <strong>Demo 角色</strong>
          </div>

          <div className="live-shift-list">
            {snapshot.providers.map((provider) => {
              const pending = snapshot.invitations.find(
                (item) =>
                  item.providerId === provider.id && item.status === "pending"
              );
              return (
                <article className="live-shift-row" key={provider.id}>
                  <div className="live-shift-person">
                    <span className={`live-status is-${provider.status}`}>
                      <i aria-hidden />{providerStatus(provider)}
                    </span>
                    <strong>{provider.displayName}</strong>
                    <small>{provider.serviceTitle}</small>
                  </div>

                  {pending ? (
                    <div className="live-invitation-actions">
                      <div className="live-countdown" aria-label={`剩餘 ${secondsRemaining} 秒`}>
                        <strong>{secondsRemaining}</strong>
                        <span>秒內回覆</span>
                      </div>
                      <button
                        className="button button-small button-primary"
                        disabled={busyKey !== null}
                        onClick={() =>
                          runAction(
                            { action: "accept", invitationId: pending.id },
                            `accept:${pending.id}`
                          )
                        }
                        type="button"
                      >
                        接受
                      </button>
                      <button
                        className="button button-small button-dark"
                        disabled={busyKey !== null}
                        onClick={() =>
                          runAction(
                            { action: "decline", invitationId: pending.id },
                            `decline:${pending.id}`
                          )
                        }
                        type="button"
                      >
                        拒絕
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`button button-small ${
                        provider.status === "online" ? "button-dark" : "button-primary"
                      }`}
                      disabled={provider.status === "busy" || busyKey !== null}
                      onClick={() =>
                        runAction(
                          {
                            action:
                              provider.status === "online" ? "clock_out" : "clock_in",
                            providerId: provider.id,
                          },
                          `shift:${provider.id}`
                        )
                      }
                      type="button"
                    >
                      {provider.status === "online"
                        ? "打卡下班"
                        : provider.status === "busy"
                          ? "訂單已成立"
                          : "打卡上班"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className="live-panel live-history-panel">
        <div className="live-panel-heading">
          <div>
            <span>INVITATION LOG</span>
            <h2>邀請與返點紀錄</h2>
          </div>
          <strong>最近 {snapshot.invitations.length} 筆</strong>
        </div>

        {snapshot.invitations.length ? (
          <div className="live-history-list">
            {snapshot.invitations.map((invitation) => (
              <article key={invitation.id}>
                <div>
                  <span>{invitation.providerName}</span>
                  <strong>{invitation.serviceTitle}</strong>
                </div>
                <div>
                  <span>{invitation.points} 點</span>
                  <strong className={`invitation-${invitation.status}`}>
                    {invitationLabels[invitation.status]}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="live-empty-state compact">
            <p>完成第一次打卡與邀請後，紀錄會出現在這裡。</p>
          </div>
        )}
      </section>
    </div>
  );
}
