import type { Metadata } from "next";
import { ApplicationForm } from "@/components/application-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "成為陪玩師", description: "提交陪玩師申請，由 Owner 本人逐筆人工審核。" };

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />
      <main className="form-page section-shell">
        <header className="form-page-hero">
          <div><p className="eyebrow">第一批陪玩師招募</p><h1>你負責把服務做好，<br />站長負責把麻煩擋下來。</h1></div>
          <div className="form-page-promise"><strong>前 10 筆完成訂單平台費 0%</strong><p>不要求獨家、協助整理個人頁與商品文案；正式金流上線後才會開始真實交易。</p></div>
        </header>
        <div className="form-layout">
          <ApplicationForm />
          <aside className="form-aside">
            <div><span>申請後會發生什麼</span><ol><li>站長先看服務定位與界線</li><li>人工確認真人照片與語音</li><li>技術服務再驗證戰績</li><li>確認價格、時段與外部聯繫</li><li>核准後才會建立公開頁</li></ol></div>
            <div className="aside-warning"><strong>不接受</strong><p>未滿 18 歲、色情與裸聊、線下交換、戀愛承諾誘導、代打外掛、冒用素材與私下收款拒絕履約。</p></div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
