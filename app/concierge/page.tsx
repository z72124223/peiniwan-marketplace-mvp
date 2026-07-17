import type { Metadata } from "next";
import { ConciergeForm } from "@/components/concierge-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { seedProviders } from "@/lib/seed-data";

export const metadata: Metadata = { title: "站長幫你配", description: "告訴站長遊戲、時間、預算與偏好，由真人人工媒合。" };

export default async function ConciergePage({ searchParams }: { searchParams: Promise<{ provider?: string }> }) {
  const { provider } = await searchParams;
  const preferredProvider = seedProviders.find((item) => item.id === provider)?.displayName;

  return (
    <>
      <SiteHeader />
      <main className="form-page concierge-page section-shell">
        <header className="form-page-hero concierge-hero">
          <div><p className="eyebrow">不知道選誰？交給真人</p><h1>把今晚想要的感覺，<br />告訴站長就好。</h1></div>
          <div className="owner-promise-card"><span><i /> 站長目前在線</span><strong>預計 10 分鐘內回覆</strong><p>這不是自動推薦。本人會看遊戲、時段、預算與你在意的互動方式。</p></div>
        </header>
        <div className="form-layout">
          <ConciergeForm preferredProvider={preferredProvider} />
          <aside className="form-aside">
            <div><span>人工派單流程</span><ol><li>你送出遊戲與偏好</li><li>站長挑 1–3 位合適人選</li><li>確認時段與最終價格</li><li>你同意後才建立訂單</li><li>完成服務後分項評價</li></ol></div>
            <div className="aside-warning aside-note"><strong>這一版不會扣款</strong><p>目前只驗證派單流程與營運介面；正式金流、KYC 與外部通知尚未啟用。</p></div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
