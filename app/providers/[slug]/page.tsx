import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VoiceSampleButton } from "@/components/voice-sample-button";
import { billingUnitLabel, formatPrice, serviceAxisLabel } from "@/lib/format";
import { seedGames, seedProviders } from "@/lib/seed-data";

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

  return (
    <>
      <SiteHeader />
      <main className="profile-main section-shell">
        <Link className="back-link" href="/explore">← 回到陪玩師列表</Link>
        <section className="profile-hero">
          <div className="profile-photo-large">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={provider.imageUrl} alt={`${provider.displayName}的示範人像`} />
            <span className={`status-badge status-${provider.onlineStatus}`}><i />{provider.onlineStatus === "online" ? "現在可接" : provider.onlineStatus === "busy" ? "服務中" : "稍後回覆"}</span>
          </div>
          <div className="profile-intro">
            <div className="profile-title-line">
              <span className="axis-label">{serviceAxisLabel(provider.axis)}</span>
              <span className="verified-line">✓ 照片與語音已人工審核</span>
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
              <li>爭議由 Owner 人工處理</li>
            </ul>
            <Link className="button button-primary button-full" href={`/concierge?provider=${provider.id}`}>請站長安排</Link>
            <small>通常 {provider.responseTimeMinutes} 分鐘內回覆</small>
          </aside>
        </section>

        <section className="profile-details">
          <div className="score-panel">
            <p className="eyebrow">雙軸評分</p>
            <div className="big-score-grid">
              <div><span>情緒價值</span><strong>{provider.emotionalScore.toFixed(1)}</strong><i style={{ width: `${provider.emotionalScore * 20}%` }} /></div>
              <div><span>技術能力</span><strong>{provider.technicalScore.toFixed(1)}</strong><i style={{ width: `${provider.technicalScore * 20}%` }} /></div>
            </div>
            <p>{provider.reviewCount} 則完成訂單評價・{provider.repeatRate}% 熟客再次指定</p>
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
              <span className={provider.verifiedPhoto ? "verified" : ""}>✓ 真人照片</span>
              <span className={provider.verifiedVoice ? "verified" : ""}>✓ 語音樣本</span>
              <span className={provider.verifiedSkill ? "verified" : "muted"}>{provider.verifiedSkill ? "✓ 技術證明" : "— 此服務不需技術證明"}</span>
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
