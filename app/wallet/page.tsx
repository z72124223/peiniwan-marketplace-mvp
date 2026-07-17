import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatPrice } from "@/lib/format";
import {
  walletDemoMoneyEntries,
  walletDemoPointEntries,
  walletDemoProfile,
} from "@/lib/wallet-demo-data";

export const metadata: Metadata = {
  title: "陪玩師錢包示範",
  description: "陪玩師收益與可靠度點數的唯讀帳務預覽。",
};

const moneyCards = [
  {
    label: "可提領",
    amountMinor: walletDemoProfile.availableMinor,
    note: "已過等待期，沒有爭議",
    tone: "available",
  },
  {
    label: "待入帳",
    amountMinor: walletDemoProfile.pendingMinor,
    note: "等服務與訂單確認",
    tone: "pending",
  },
  {
    label: "爭議凍結",
    amountMinor: walletDemoProfile.frozenMinor,
    note: "保留原收益，待人工確認",
    tone: "frozen",
  },
  {
    label: "累計已撥",
    amountMinor: walletDemoProfile.paidMinor,
    note: "外部服務商確認後才計入",
    tone: "paid",
  },
] as const;

export default function WalletPage() {
  return (
    <>
      <SiteHeader />
      <main className="wallet-page">
        <section className="wallet-hero section-shell">
          <div className="wallet-title-block">
            <p className="eyebrow">陪玩師帳務・{walletDemoProfile.displayName}</p>
            <h1>每一筆錢，<span>現在卡在哪裡。</span></h1>
            <p>
              收益和可靠度分開算。錢不會因為扣點消失，帳務有問題也只會先凍結，等人工把事情查清楚。
            </p>
          </div>

          <aside className="wallet-demo-notice" aria-label="示範資料提醒">
            <span>DEMO</span>
            <div>
              <strong>帳務預覽・沒有真實款項</strong>
              <p>目前沒有接通付款或撥款，也不能在這裡提領、儲值或轉帳。</p>
            </div>
          </aside>
        </section>

        <section className="wallet-summary section-shell" aria-label="收益狀態">
          {moneyCards.map((card) => (
            <article className="wallet-money-card" data-tone={card.tone} key={card.label}>
              <div className="wallet-card-label">
                <i aria-hidden />
                <span>{card.label}</span>
              </div>
              <strong>{formatPrice(card.amountMinor, walletDemoProfile.currency)}</strong>
              <p>{card.note}</p>
            </article>
          ))}
        </section>

        <section className="wallet-body section-shell">
          <div className="wallet-ledger-panel">
            <div className="wallet-section-heading">
              <div>
                <p className="eyebrow">收益明細</p>
                <h2>不是只給你一個餘額。</h2>
              </div>
              <span>示範紀錄</span>
            </div>

            <div className="wallet-entry-list">
              {walletDemoMoneyEntries.map((entry) => (
                <article className="wallet-entry" key={entry.id}>
                  <div className="wallet-entry-copy">
                    <time>{entry.date}</time>
                    <strong>{entry.title}</strong>
                    <p>{entry.note}</p>
                  </div>
                  <div className="wallet-entry-value">
                    <span data-status={entry.status}>{entry.statusLabel}</span>
                    <strong>{formatPrice(entry.amountMinor, walletDemoProfile.currency)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="reliability-panel">
            <p className="eyebrow">接單可靠度</p>
            <div className="reliability-score">
              <strong>{walletDemoProfile.reliabilityPoints}</strong>
              <span>/ {walletDemoProfile.reliabilityMaximum}</span>
            </div>
            <div className="reliability-meter" aria-label="可靠度 95 分（滿分 100 分）">
              <i style={{ width: `${walletDemoProfile.reliabilityPoints}%` }} />
            </div>
            <p className="reliability-intro">
              打卡代表真的準備接單。被玩家選中後，若 1 分鐘內沒有接受，系統會自動下線並留下扣點紀錄。
            </p>

            <div className="point-entry-list">
              {walletDemoPointEntries.map((entry) => (
                <article key={entry.id}>
                  <div>
                    <time>{entry.date}</time>
                    <strong>{entry.title}</strong>
                    <p>{entry.note}</p>
                  </div>
                  <b className={entry.deltaPoints < 0 ? "is-negative" : "is-positive"}>
                    {entry.deltaPoints > 0 ? "+" : ""}{entry.deltaPoints}
                  </b>
                </article>
              ))}
            </div>

            <div className="points-boundary">
              <strong>點數不是錢</strong>
              <p>不可購買、轉讓、提領、折抵，也不能兌換現金。</p>
            </div>
          </aside>
        </section>

        <section className="wallet-flow section-shell">
          <div>
            <p className="eyebrow">錢怎麼走</p>
            <h2>先把帳算清楚，才談提領。</h2>
          </div>
          <ol>
            <li><span>01</span><strong>訂單完成</strong><p>收益先進待入帳，不會立刻變成可提領。</p></li>
            <li><span>02</span><strong>等待確認</strong><p>沒有退款或爭議，才會釋放成可提領。</p></li>
            <li><span>03</span><strong>外部撥款</strong><p>正式版由合規服務商處理；平台不做儲值錢包。</p></li>
          </ol>
          <div className="wallet-closed-action" aria-label="正式提領尚未開放">
            正式提領尚未開放
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
