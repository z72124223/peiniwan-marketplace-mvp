import type { Metadata } from "next";
import { LiveMarketplaceDemo } from "@/components/live-marketplace-demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "即時接單 Demo",
  description: "陪玩師打卡、在線池、60 秒邀請與逾時返點私人示範。",
};

export default function LiveMarketplacePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-main section-shell live-page-main">
        <div className="page-heading live-page-heading">
          <p className="eyebrow">打卡・在線・60 秒接單</p>
          <h1>從玩家選人，到陪玩師回覆。</h1>
          <p>
            在同一個私人操作台測試兩種角色：先替陪玩師打卡，再由 Demo
            玩家保留點數並送出邀請。
          </p>
          <p className="live-server-boundary">
            這是角色操作模擬，不是正式登入；下方同時包含「在線陪玩師」與「陪玩師打卡台」，不會接收真實付款。
          </p>
        </div>
        <LiveMarketplaceDemo />
      </main>
      <SiteFooter />
    </>
  );
}
