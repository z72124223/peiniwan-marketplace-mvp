import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSeedReviews, seedGames, seedProviders } from "@/lib/seed-data";

export function generateStaticParams() {
  return seedProviders.map((provider) => ({ slug: provider.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const provider = seedProviders.find((item) => item.slug === slug);
  return provider
    ? { title: `${provider.displayName}的玩家評價`, description: `查看 ${provider.displayName} 的陪伴、技術與服務評價。` }
    : { title: "找不到評價" };
}

export default async function ProviderReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = seedProviders.find((item) => item.slug === slug);
  if (!provider) notFound();

  const reviews = getSeedReviews(provider.id);
  const overallScore = ((provider.emotionalScore + provider.technicalScore) / 2).toFixed(1);

  return (
    <>
      <SiteHeader />
      <main className="reviews-page section-shell">
        <Link className="back-link" href={`/providers/${provider.slug}`}>← 回到 {provider.displayName} 的資料頁</Link>

        <header className="reviews-hero">
          <div className="reviews-provider">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={provider.imageUrl} alt={`${provider.displayName}的示範人像`} />
            <div>
              <p className="eyebrow">示範留言</p>
              <h1>{provider.displayName}<span>{overallScore}</span></h1>
              <p>{reviews.length} 則示範留言・不是實際交易紀錄</p>
            </div>
          </div>
          <div className="reviews-score-summary" aria-label={`${provider.displayName}的評分摘要`}>
            <div><span>情緒</span><strong>{provider.emotionalScore.toFixed(1)}</strong></div>
            <div><span>技術</span><strong>{provider.technicalScore.toFixed(1)}</strong></div>
          </div>
        </header>

        <section className="reviews-heading">
          <div>
            <span className="eyebrow">看看文字合不合你的胃口</span>
            <h2>分數只能看大概，留言比較有用。</h2>
          </div>
          <p>以下內容只用來測試版面與閱讀感，不代表真實玩家、訂單或服務結果。正式版只接受完成服務後的留言。</p>
        </section>

        <section className="review-list" aria-label={`${provider.displayName}的評價列表`}>
          {reviews.map((review) => {
            const game = seedGames.find((item) => item.id === review.gameId);
            return (
              <article className="review-card" key={review.id}>
                <div className="review-card-top">
                  <div className="reviewer-avatar" aria-hidden>{review.reviewerName.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong>{review.reviewerName}</strong>
                    <span>示範留言・非真實訂單</span>
                  </div>
                  {review.repeatCustomer && <span className="repeat-badge">示範：想再約</span>}
                </div>
                <div className="review-rating-line">
                  <span className="review-score-label">整體</span>
                  <strong>{review.rating.toFixed(1)}</strong>
                  <span>{game?.name}・{review.serviceLabel}</span>
                </div>
                <blockquote>「{review.text}」</blockquote>
                <div className="review-sub-scores">
                  <span>聊天／陪伴 <strong>{review.emotionalScore.toFixed(1)}</strong></span>
                  <span>遊戲／技術 <strong>{review.technicalScore.toFixed(1)}</strong></span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="reviews-cta">
          <div><span className="eyebrow">覺得適合？</span><h2>請站長幫你問時段。</h2><p>目前不會直接扣款，先把想玩的時間和需求說清楚。</p></div>
          <Link className="button button-primary" href={`/concierge?provider=${provider.id}`}>安排 {provider.displayName}</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
