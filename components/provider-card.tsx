import Link from "next/link";
import { getSeedReviews, type SeedProvider } from "@/lib/seed-data";
import { formatPrice, billingUnitLabel, serviceAxisLabel } from "@/lib/format";
import { VoiceSampleButton } from "./voice-sample-button";

export function ProviderCard({ provider }: { provider: SeedProvider }) {
  const reviewCount = getSeedReviews(provider.id).length;

  return (
    <article className="provider-card">
      <Link className="provider-photo" href={`/providers/${provider.slug}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={provider.imageUrl} alt={`${provider.displayName}的示範人像`} loading="lazy" />
        <span className="status-badge status-demo">
          <i />
          示範資料
        </span>
        <span className="axis-badge">{serviceAxisLabel(provider.axis)}</span>
      </Link>
      <div className="provider-card-body">
        <div className="provider-title-row">
          <div>
            <h3><Link href={`/providers/${provider.slug}`}>{provider.displayName}</Link></h3>
            <p>{provider.publicGender}・{provider.headline}</p>
          </div>
          <span className="demo-mark" title="示範資料，尚未完成真人驗證">Demo</span>
        </div>
        <div className="tag-row">
          {provider.personaTags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="score-row">
          <span>聊天 <strong>{provider.emotionalScore.toFixed(1)}</strong></span>
          <span>遊戲 <strong>{provider.technicalScore.toFixed(1)}</strong></span>
          <Link className="review-count-link" href={`/providers/${provider.slug}/reviews`} aria-label={`查看 ${provider.displayName} 的 ${reviewCount} 則示範留言`}>
            {reviewCount} 則示範留言 <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className="provider-card-actions">
          <VoiceSampleButton name={provider.displayName} text={provider.voiceIntro} compact />
          <div className="price-block">
            <strong>{formatPrice(provider.priceAmountMinor, provider.currency)}</strong>
            <span>／{billingUnitLabel(provider.billingUnit)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
