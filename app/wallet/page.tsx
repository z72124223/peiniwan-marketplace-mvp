import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  walletDemoExchange,
  walletDemoPlayer,
  walletDemoPlayerEntries,
  walletDemoProvider,
  walletDemoProviderEntries,
} from "@/lib/wallet-demo-data";

export const metadata: Metadata = {
  title: "金錢點數錢包示範",
  description: "台幣買點、陪玩扣點、逾時扣款與現金兌換的唯讀預覽。",
};

function formatPoints(points: number) {
  return `${points.toLocaleString("zh-TW")} 點`;
}

function formatPointDelta(points: number) {
  return `${points > 0 ? "+" : ""}${points.toLocaleString("zh-TW")} 點`;
}

const summaryCards = [
  {
    label: "玩家可用",
    points: walletDemoPlayer.availablePoints,
    note: "可選陪玩或購買平台商品",
    tone: "available",
  },
  {
    label: "玩家已保留",
    points: walletDemoPlayer.heldPoints,
    note: "等陪玩師接受；逾時會全數返還",
    tone: "pending",
  },
  {
    label: "陪玩師可兌現",
    points: walletDemoProvider.redeemablePoints,
    note: "具台幣價值，可進入撥款流程",
    tone: "paid",
  },
  {
    label: "陪玩師待入帳",
    points: walletDemoProvider.pendingPoints,
    note: "服務完成，等待確認與爭議期",
    tone: "frozen",
  },
] as const;

export default function WalletPage() {
  return (
    <>
      <SiteHeader />
      <main className="wallet-page">
        <section className="wallet-hero section-shell">
          <div className="wallet-title-block">
            <p className="eyebrow">金錢點數錢包・Demo</p>
            <h1>台幣買點，<span>點數就是錢。</span></h1>
            <p>
              玩家用點數選陪玩師；陪玩師完成服務後取得可兌現點數。打卡後被選中卻沒有在 1 分鐘內接受，扣的也是陪玩師錢包。
            </p>
          </div>

          <aside className="wallet-demo-notice" aria-label="示範資料提醒">
            <span>DEMO</span>
            <div>
              <strong>{walletDemoExchange.label}</strong>
              <p>產品模型已按金錢點數設計；目前仍未接收或撥付真實款項。</p>
            </div>
          </aside>
        </section>

        <section className="wallet-summary section-shell" aria-label="點數錢包摘要">
          {summaryCards.map((card) => (
            <article className="wallet-money-card" data-tone={card.tone} key={card.label}>
              <div className="wallet-card-label"><i aria-hidden /><span>{card.label}</span></div>
              <strong>{formatPoints(card.points)}</strong>
              <p>{card.note}</p>
            </article>
          ))}
        </section>

        <section className="wallet-money-model section-shell">
          <div>
            <span>01</span>
            <strong>玩家用台幣買點</strong>
            <p>付款成功後加入可用點數，同時記錄當時匯率與台幣價值。</p>
          </div>
          <i aria-hidden>→</i>
          <div>
            <span>02</span>
            <strong>點選陪玩先保留</strong>
            <p>不是立刻花掉。對方拒絕或逾時，保留點數完整退回。</p>
          </div>
          <i aria-hidden>→</i>
          <div>
            <span>03</span>
            <strong>完成後才能兌現</strong>
            <p>服務完成後進入陪玩師收益，等待期結束才可申請換台幣。</p>
          </div>
        </section>

        <section className="wallet-body section-shell">
          <div className="wallet-ledger-panel">
            <div className="wallet-section-heading">
              <div>
                <p className="eyebrow">玩家錢包・{walletDemoPlayer.displayName}</p>
                <h2>先保留，接單成立才扣。</h2>
              </div>
              <span>示範紀錄</span>
            </div>

            <div className="wallet-entry-list">
              {walletDemoPlayerEntries.map((entry) => (
                <article className="wallet-entry" key={entry.id}>
                  <div className="wallet-entry-copy">
                    <time>{entry.date}</time>
                    <strong>{entry.title}</strong>
                    <p>{entry.note}</p>
                  </div>
                  <div className="wallet-entry-value">
                    <span data-status={entry.status}>{entry.statusLabel}</span>
                    <strong className={entry.deltaPoints < 0 ? "is-negative" : "is-positive"}>
                      {formatPointDelta(entry.deltaPoints)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="wallet-rule-panel">
            <p className="eyebrow">逾時規則</p>
            <strong className="wallet-rule-time">1:00</strong>
            <p className="wallet-rule-intro">
              陪玩師打卡後被玩家選中，必須在 1 分鐘內接受。沒有接受就會自動下線，並直接扣除錢包裡可兌現的點數。
            </p>
            <div className="wallet-penalty-example">
              <span>示範扣款</span>
              <strong>−10 點</strong>
              <p>約 NT$10・正式扣款額尚未定案</p>
            </div>
            <ol className="wallet-rule-list">
              <li><span>1</span>玩家保留點數全數返還</li>
              <li><span>2</span>陪玩師自動下線</li>
              <li><span>3</span>陪玩師錢包直接扣點</li>
              <li><span>4</span>申訴成立後用沖正補回</li>
            </ol>
          </aside>
        </section>

        <section className="wallet-body section-shell">
          <div className="wallet-ledger-panel">
            <div className="wallet-section-heading">
              <div>
                <p className="eyebrow">陪玩師錢包・{walletDemoProvider.displayName}</p>
                <h2>收入、扣款、兌現都留紀錄。</h2>
              </div>
              <span>示範紀錄</span>
            </div>
            <div className="wallet-entry-list">
              {walletDemoProviderEntries.map((entry) => (
                <article className="wallet-entry" key={entry.id}>
                  <div className="wallet-entry-copy">
                    <time>{entry.date}</time>
                    <strong>{entry.title}</strong>
                    <p>{entry.note}</p>
                  </div>
                  <div className="wallet-entry-value">
                    <span data-status={entry.status}>{entry.statusLabel}</span>
                    <strong className={entry.deltaPoints < 0 ? "is-negative" : "is-positive"}>
                      {formatPointDelta(entry.deltaPoints)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="wallet-rule-panel wallet-redemption-panel">
            <p className="eyebrow">點數可換現金</p>
            <strong className="wallet-rule-time">{formatPoints(walletDemoProvider.redeemablePoints)}</strong>
            <p className="wallet-rule-intro">
              這不是遊戲分數。可兌現點數有台幣價值，正式版會交給外部金流服務商撥款。
            </p>
            <div className="wallet-balance-detail">
              <div><span>爭議凍結</span><strong>{formatPoints(walletDemoProvider.frozenPoints)}</strong></div>
              <div><span>累計已兌現</span><strong>{formatPoints(walletDemoProvider.lifetimeRedeemedPoints)}</strong></div>
            </div>
            <div className="wallet-closed-action">真實兌現尚未接通</div>
          </aside>
        </section>

        <section className="wallet-flow section-shell">
          <div>
            <p className="eyebrow">下一個用途</p>
            <h2>同一種點數，也能買虛擬禮物。</h2>
          </div>
          <p className="wallet-gift-copy">
            禮物會沿用同一套金錢點數帳本與分潤紀錄。目前只預留帳務路徑，商城、送禮按鈕與玩家間轉點都還沒開放。
          </p>
          <div className="wallet-trade-locks">
            <span>虛擬禮物・尚未開放</span>
            <span>玩家間轉點・尚未開放</span>
            <span>點數交易市場・尚未開放</span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
