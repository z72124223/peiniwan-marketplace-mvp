import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "合法與禁止服務政策",
  description: "陪你玩私密 MVP 的 18+、允許服務、禁止內容、檢舉與人工處置政策草案。",
};

const allowed = [
  "線上遊戲陪玩、休閒組隊、戰術溝通與賽後復盤",
  "與遊戲同時進行的非醫療性聊天、傾聽與氣氛陪伴",
  "遊戲技巧教學、觀念拆解與可驗證的牌位說明",
  "經雙方同意的角色語氣、聲線與互動風格",
];

const prohibited = [
  "未成年人參與、性交易、裸露、色情或性暗示付費升級",
  "賭博、代儲、詐騙、勒索、非法支付或規避風控",
  "帳號買賣、盜用、外掛、代打、洗分與其他作弊",
  "仇恨、威脅、騷擾、跟蹤、霸凌、非自願羞辱",
  "索取密碼、驗證碼、金融帳戶、住址或公開他人個資",
  "未經同意錄音、錄影、直播、轉傳或模型訓練",
];

export default function PoliciesPage() {
  return (
    <>
      <SiteHeader />
      <main className="policy-page section-shell">
        <header className="policy-hero">
          <span className="eyebrow">TRUST &amp; SAFETY・v0.2 草案</span>
          <h1>能被清楚說明的界線，才有資格談陪伴。</h1>
          <p>平台只服務年滿 18 歲的使用者。陪你玩提供的是遊戲、語音互動、陪伴感與技能服務媒合，不是色情、博弈、代打或心理治療平台。</p>
          <div className="policy-draft-note"><strong>重要：</strong>這是私密 MVP 的營運政策草案，不能取代正式使用者條款、隱私權政策或合格法律意見。</div>
        </header>

        <section className="policy-split">
          <article className="policy-card policy-card-allowed">
            <span>允許</span><h2>合法、透明、有同意</h2>
            <ul>{allowed.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article className="policy-card policy-card-blocked">
            <span>禁止</span><h2>不因「只是陪玩」而例外</h2>
            <ul>{prohibited.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </section>

        <section className="policy-process">
          <div>
            <span className="eyebrow">REPORT &amp; REVIEW</span>
            <h2>每個高風險決定，都有人負責。</h2>
          </div>
          <ol>
            <li><strong>停止與回報</strong><p>覺得不安全時先離開互動，保留合法取得的最小必要證據。</p></li>
            <li><strong>風險分級</strong><p>站長可先隱藏服務或暫停資格，再向雙方收集說明。</p></li>
            <li><strong>人工決策</strong><p>補件、拒絕、退款、停權與解封皆須留下原因與稽核。</p></li>
            <li><strong>申訴與覆核</strong><p>當事人可補充新證據；未來有團隊後導入雙人覆核。</p></li>
          </ol>
        </section>

        <section className="policy-boundaries">
          <article><span>18+</span><h3>不服務未成年人</h3><p>謊報年齡、招攬未成年人或要求私下聯絡，一律禁止。</p></article>
          <article><span>0</span><h3>不做 AI 自動封禁</h3><p>正式開放後，所有高風險處置都由站長人工判斷。</p></article>
          <article><span>Demo</span><h3>現在不會收款</h3><p>目前價格和流程只用來測試畫面，不會建立真實訂單或退款。</p></article>
          <article><span>Global</span><h3>不宣稱中國合規上線</h3><p>中國區需獨立資料面與當地法律、雲端、身份及金流覆核。</p></article>
        </section>

        <section className="policy-cta">
          <div><span className="eyebrow">NEED HELP?</span><h2>不確定能不能提供？先問，再上架。</h2><p>政策寧可寫得清楚，也不讓陪玩師或玩家靠猜測承擔風險。</p></div>
          <Link className="button button-primary" href="/concierge">聯絡站長</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
