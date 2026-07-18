import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner section-shell">
        <Link className="brand" href="/" aria-label="陪你玩首頁">
          陪你玩<span aria-hidden>。</span>
        </Link>
        <nav className="desktop-nav" aria-label="主要導覽">
          <Link href="/explore">找陪玩師</Link>
          <Link href="/live">即時接單 Demo</Link>
          <Link href="/concierge">站長幫你配</Link>
          <Link href="/apply">成為陪玩師</Link>
          <Link href="/policies">服務界線</Link>
        </nav>
        <div className="header-actions">
          <Link className="button button-small button-dark" href="/concierge">
            跟站長說需求
          </Link>
        </div>
      </div>
    </header>
  );
}
