import Link from "next/link";
import { ProviderCard } from "@/components/provider-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { seedGames, seedProviders } from "@/lib/seed-data";

const heroProviders = seedProviders.slice(0, 3);

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero section-shell">
          <div className="hero-copy">
            <p className="eyebrow">18+・先看人，再決定要不要約</p>
            <h1>今晚，找個<span>合拍的隊友。</span></h1>
            <p className="hero-lede">
              想輕鬆打幾場、找人聊天，還是認真練一局？先看照片、聽聲音，覺得對再約。
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/explore?axis=emotional">
                我想輕鬆玩
              </Link>
              <Link className="button button-secondary" href="/explore?axis=technical">
                我想認真打
              </Link>
            </div>
            <Link className="concierge-link" href="/concierge">
              懶得一個個看？跟站長說你要什麼 <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="hero-gallery" aria-label="示範陪玩師">
            {heroProviders.map((provider, index) => (
              <article className={`hero-person hero-person-${index + 1}`} key={provider.id}>
                {/* External demo portraits are intentionally rendered as native images. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={provider.imageUrl} alt={`${provider.displayName}的示範人像`} />
                <div>
                  <strong>{provider.displayName}</strong>
                  <span>{provider.personaTags.slice(0, 2).join("・")}</span>
                </div>
              </article>
            ))}
            <div className="hero-note">
              示範名單・尚未開放接單
            </div>
          </div>
        </section>

        <section className="trust-strip section-shell" aria-label="平台特色">
          <span>正式上架前會人工確認照片與語音</span>
          <span>目前價格是示範，不會直接扣款</span>
          <span>需求會由真人站長逐筆查看</span>
        </section>

        <section className="need-section section-shell">
          <div className="section-heading">
            <p className="eyebrow">你今天是哪一種？</p>
            <h2>不用想太多，照你現在的心情選。</h2>
          </div>
          <div className="need-grid">
            <Link className="need-card" href="/explore?axis=emotional">
              <span className="need-number">01</span>
              <div>
                <h3>輕鬆打幾場</h3>
                <p>下班很累，只想有人一起排、不尬聊，也不催你。</p>
                <span className="text-link">看看誰適合 →</span>
              </div>
            </Link>
            <Link className="need-card" href="/explore?axis=technical">
              <span className="need-number">02</span>
              <div>
                <h3>想把技術練上去</h3>
                <p>卡牌位、剛換位置，或想找人把問題直接講清楚。</p>
                <span className="text-link">找懂的人帶 →</span>
              </div>
            </Link>
            <Link className="need-card need-card-accent" href="/concierge">
              <span className="need-number">03</span>
              <div>
                <h3>我懶得選</h3>
                <p>遊戲、時間、預算丟給站長，本人幫你問誰有空。</p>
                <span className="text-link">直接跟站長說 →</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="providers-section section-shell">
          <div className="section-heading heading-row">
            <div>
              <p className="eyebrow">先逛逛示範名單</p>
              <h2>先看看人，再聽聽聲音。</h2>
            </div>
            <Link className="text-link" href="/explore">
              看全部陪玩師 →
            </Link>
          </div>
          <div className="provider-grid">
            {seedProviders.slice(0, 3).map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        <section className="how-section section-shell">
          <div className="how-copy">
            <p className="eyebrow">第一次找也沒關係</p>
            <h2>看對眼、聊得來，再約時間。</h2>
            <p>
              現在可以先看資料、聽聲音，再把需求留給站長。這裡不會扣款，也沒有保證回覆時間；正式開放後才會公布付款與確認流程。
            </p>
          </div>
          <ol className="steps-list">
            <li>
              <span>1</span>
              <div><strong>看資料、聽聲音</strong><p>示範照片、人設、留言和價格都先看過，再決定要不要問。</p></div>
            </li>
            <li>
              <span>2</span>
              <div><strong>自己選，或交給站長</strong><p>不確定就填一張需求單，由真人幫你縮小選擇。</p></div>
            </li>
            <li>
              <span>3</span>
              <div><strong>確認後再往下走</strong><p>目前只收需求，不會建立付款訂單；正式流程會在開放前說清楚。</p></div>
            </li>
          </ol>
        </section>

        <section className="games-section section-shell">
          <div className="section-heading">
            <p className="eyebrow">目前先顧好這三款</p>
            <h2>有在玩的，才放上來。</h2>
          </div>
          <div className="game-list">
            {seedGames.map((game) => (
              <Link href={`/explore?game=${game.id}`} className="game-pill" key={game.id}>
                <i style={{ background: game.accent }} />
                <span>{game.name}</span>
                <small>{game.shortName}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="safety-section">
          <div className="section-shell safety-inner">
            <div>
              <p className="eyebrow eyebrow-light">聊得來很好，界線也要講清楚</p>
              <h2>陪玩是服務，不是拿感情逼你花錢。</h2>
            </div>
            <div className="safety-copy">
              <p>
                只接受 18+ 的線上合法服務。禁止裸聊、色情內容、線下交換、戀愛承諾誘導、外掛作弊、冒用照片與私下收款拒絕履約。
              </p>
              <Link className="button button-light" href="/policies">
                查看服務界線
              </Link>
            </div>
          </div>
        </section>

        <section className="final-cta section-shell">
          <p className="eyebrow">今晚想玩了嗎？</p>
          <h2>自己挑，或直接把需求丟給站長。</h2>
          <div className="hero-actions">
            <Link className="button button-primary" href="/explore">開始找陪玩師</Link>
            <Link className="button button-secondary" href="/apply">我要成為陪玩師</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
