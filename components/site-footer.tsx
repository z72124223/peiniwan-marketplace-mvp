import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-grid">
        <div>
          <Link className="brand" href="/">陪你玩<span aria-hidden>。</span></Link>
          <p>以遊戲為入口的 18+ 線上娛樂、關係感與技能服務市場。</p>
          <small>目前為私密 MVP 示範，沒有啟用正式金流或 KYC。</small>
        </div>
        <div className="footer-links">
          <strong>開始使用</strong>
          <Link href="/explore">找陪玩師</Link>
          <Link href="/concierge">站長幫你配</Link>
          <Link href="/apply">成為陪玩師</Link>
        </div>
        <div className="footer-links">
          <strong>信任與安全</strong>
          <Link href="/policies">合法與禁止服務</Link>
          <Link href="/owner">Owner 營運骨架</Link>
        </div>
      </div>
      <div className="section-shell footer-bottom">
        <span>© 2026 陪你玩</span>
        <span>18+ only・Demo data</span>
      </div>
    </footer>
  );
}
