import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore-client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { ServiceAxis } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "找陪玩師",
  description: "依照感覺、技術、遊戲與在線狀態找到合拍的陪玩師。",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ axis?: string; game?: string }>;
}) {
  const params = await searchParams;
  const axis = ["emotional", "technical", "hybrid"].includes(params.axis ?? "")
    ? (params.axis as ServiceAxis)
    : "all";

  return (
    <>
      <SiteHeader />
      <main className="page-main section-shell">
        <div className="page-heading">
          <p className="eyebrow">找一個今晚合拍的人</p>
          <h1>先選感覺，再選遊戲。</h1>
          <p>照片、聲音、人設、技術與價格都可以看；服務能力不由性別決定。</p>
        </div>
        <ExploreClient initialAxis={axis} initialGame={params.game ?? "all"} />
      </main>
      <SiteFooter />
    </>
  );
}
