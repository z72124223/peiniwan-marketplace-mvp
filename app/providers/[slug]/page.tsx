import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VoiceSampleButton } from "@/components/voice-sample-button";
import { billingUnitLabel, formatPrice, serviceAxisLabel } from "@/lib/format";
import { getSeedReviews, seedGames, seedProviders } from "@/lib/seed-data";

export function generateStaticParams() {
  return seedProviders.map((provider) => ({ slug: provider.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const provider = seedProviders.find((item) => item.slug === slug);
  return provider
    ? { title: provider.displayName, description: provider.headline }
    : { title: "找不到陪玩師" };
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = seedProviders.find((item) => item.slug === slug);
  if (!provider) notFound();
  const games = seedGames.filter((game) => provider.games.includes(game.id));
  const reviewCount = getSeedReviews(provider.id).length;

  return (
    <>
      <SiteHeader />
      <main className="profile-main section-shell">
        <Link className="back-link" href="/explore">← 回到陪玩師列表</Link>
        <section className="profile-hero">
          <div className="profile-photo-large">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={provider.imageUrl} alt={`${provider.displayName}的示範人像`} />
            <span className="status-badge status-demo"><i />示範資料</span>
          </div>
          <div className="profile-intro">
            <div className="profile-title-line">
              <span className="axis-label">{serviceAxisLabel(provider.axis)}</span>
              <span className="verified-line">Demo 個人頁・尚未完成真人驗證</span>
            </div>
            <h1>{provider.displayName}<small>{provider.publicGender}</small></h1>
            <h2>{provider.headline}</h2>
            <p>{provider.biography}</p>
            <div className="tag-row profile-tags">
              {[...provider.personaTags, ...provider.interactionTags].map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <VoiceSampleButton name={provider.displayName} text={provider.voiceIntro} />
          </div>
          <aside className="booking-card">
            <span>本次服務</span>
            <h3>{provider.headline.split("・")[0]}</h3>
            <div className="booking-price"><strong>{formatPrice(provider.priceAmountMinor, provider.currency)}</strong><span>／{billingUnitLabel(provider.billingUnit)}</span></div>
            <ul>
              <li>玩家看到的就是最終價</li>
              <li>正式付款尚未啟用</li>
              <li>正式開放後由站長處理爭議</li>
            </ul>
            <Link className="button button-primary button-full" href={`/concierge?provider=${provider.id}`}>請站長安排</Link>
            <small>目前沒有即時在線狀態或回覆時間承諾</small>
          </aside>
        </section>

        <section className="profile-details">
          <div className="score-panel">
            <p className="eyebrow">示範評分</p>
            <div className="big-score-grid">
              <div><span>聊天／陪伴</span><strong>{provider.emotionalScore.toFixed(1)}</strong><i style={{ width: `${provider.emotionalScore * 20}%` }} /></div>
              <div><span>遊戲／技術</span><strong>{provider.technicalScore.toFixed(1)}</strong><i style={{ width: `${provider.technicalScore * 20}%` }} /></div>
            </div>
            <p>{reviewCount} 則示範留言・不是實際交易紀錄</p>
            <Link className="profile-review-link" href={`/providers/${provider.slug}/reviews`}>
              看其他玩家怎麼說 <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="detail-panel">
            <p className="eyebrow">遊戲與能力</p>
            {games.map((game) => (
              <div className="game-skill-row" key={game.id}>
                <span><i style={{ background: game.accent }} />{game.name}</span>
                <strong>{provider.rankLabel ?? "娛樂／陪伴服務"}</strong>
              </div>
            ))}
            <div className="verification-grid">
              <span>示範照片欄位</span>
              <span>示範語音欄位</span>
              <span>{provider.rankLabel ? "示範技術資料" : "未提供技術資料"}</span>
            </div>
          </div>
        </section>

        <section className="profile-boundary">
          <div><p className="eyebrow">服務界線</p><h2>有角色感，也要尊重真實界線。</h2></div>
          <p>本頁是示範資料。禁止私下收款、線下交換、色情服務、戀愛承諾誘導與未經同意錄音。遇到不舒服的要求，可以立刻停止並請站長介入。</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
