import Link from "next/link";
import type { SeedProvider } from "@/lib/seed-data";
import { formatPrice, billingUnitLabel, serviceAxisLabel } from "@/lib/format";
import { VoiceSampleButton } from "./voice-sample-button";

export function ProviderCard({ provider }: { provider: SeedProvider }) {
  return (
    <article className="provider-card">
      <Link className="provider-photo" href={`/providers/${provider.slug}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={provider.imageUrl} alt={`${provider.displayName}的示範人像`} loading="lazy" />
        <span className={`status-badge status-${provider.onlineStatus}`}>
          <i />
          {provider.onlineStatus === "online"
            ? "現在可接"
            : provider.onlineStatus === "busy"
              ? "服務中"
              : "稍後回覆"}
        </span>
        <span className="axis-badge">{serviceAxisLabel(provider.axis)}</span>
      </Link>
      <div className="provider-card-body">
        <div className="provider-title-row">
          <div>
            <h3><Link href={`/providers/${provider.slug}`}>{provider.displayName}</Link></h3>
            <p>{provider.publicGender}・{provider.headline}</p>
          </div>
          <span className="verified-mark" title="示範資料已標示人工審核">✓</span>
        </div>
        <div className="tag-row">
          {provider.personaTags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="score-row">
          <span>情緒 <strong>{provider.emotionalScore.toFixed(1)}</strong></span>
          <span>技術 <strong>{provider.technicalScore.toFixed(1)}</strong></span>
          <span>{provider.reviewCount} 則評價</span>
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
