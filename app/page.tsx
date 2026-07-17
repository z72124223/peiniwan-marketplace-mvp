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
            <p className="eyebrow">18+ 線上娛樂與技能服務市場</p>
            <h1>
              今天想被陪伴，
              <span>還是想贏？</span>
            </h1>
            <p className="hero-lede">
              找到聲音、個性與遊戲節奏都合拍的人。想輕鬆聊、認真上分，或不知道怎麼選，站長都在。
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/explore?axis=emotional">
                今晚想有人懂你
              </Link>
              <Link className="button button-secondary" href="/explore?axis=technical">
                今晚想贏
              </Link>
            </div>
            <Link className="concierge-link" href="/concierge">
              不知道選誰？讓站長幫你配 <span aria-hidden>→</span>
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
              <span className="status-dot" />
              4 位現在可接
            </div>
          </div>
        </section>

        <section className="trust-strip section-shell" aria-label="平台特色">
          <span>真人照片與語音人工審核</span>
          <span>玩家看到的就是最終價</span>
          <span>真人站長處理派單與爭議</span>
        </section>

        <section className="need-section section-shell">
          <div className="section-heading">
            <p className="eyebrow">從今晚需要的感覺開始</p>
            <h2>不是先選遊戲，是先選你想要的體驗。</h2>
          </div>
          <div className="need-grid">
            <Link className="need-card" href="/explore?axis=emotional">
              <span className="need-number">01</span>
              <div>
                <h3>有人懂你</h3>
                <p>陪伴、聊天氛圍、被關注，也能一起輕鬆玩。</p>
                <span className="text-link">找娛樂／情緒局 →</span>
              </div>
            </Link>
            <Link className="need-card" href="/explore?axis=technical">
              <span className="need-number">02</span>
              <div>
                <h3>一起把局贏下來</h3>
                <p>上分、教學、戰術與復盤，能力證明先由站長驗過。</p>
                <span className="text-link">找技術局 →</span>
              </div>
            </Link>
            <Link className="need-card need-card-accent" href="/concierge">
              <span className="need-number">03</span>
              <div>
                <h3>站長幫你配</h3>
                <p>把遊戲、時間、預算和你在意的感覺告訴本人。</p>
                <span className="text-link">送出人工派單 →</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="providers-section section-shell">
          <div className="section-heading heading-row">
            <div>
              <p className="eyebrow">站長精選・本週可接</p>
              <h2>先聽聲音，再決定要不要一起玩。</h2>
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
            <p className="eyebrow">第一次找陪玩，也不用懂規則</p>
            <h2>先確認合不合拍，才開始正式計時。</h2>
            <p>
              本版以低風險體驗與人工派單為核心。正式交易上線後，付款授權完成可有 2–3 分鐘真人確認；不合適可換一次人。
            </p>
          </div>
          <ol className="steps-list">
            <li>
              <span>1</span>
              <div><strong>看資料、聽聲音</strong><p>照片、人設、評分、價格與驗證狀態一次看清楚。</p></div>
            </li>
            <li>
              <span>2</span>
              <div><strong>自己選，或交給站長</strong><p>不確定就填一張需求單，由真人幫你縮小選擇。</p></div>
            </li>
            <li>
              <span>3</span>
              <div><strong>外部語音完成服務</strong><p>第一版不自建語音房，聯繫與服務邊界更容易管理。</p></div>
            </li>
          </ol>
        </section>

        <section className="games-section section-shell">
          <div className="section-heading">
            <p className="eyebrow">首發遊戲可由後台替換</p>
            <h2>三款先做深，不假裝什麼都有。</h2>
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
              <p className="eyebrow eyebrow-light">有曖昧的氣氛，也要有清楚的界線</p>
              <h2>關係感可以是服務，欺騙與脅迫不是。</h2>
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
          <p className="eyebrow">今晚，就從一個舒服的選擇開始</p>
          <h2>自己慢慢看，或讓站長直接幫你配。</h2>
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
