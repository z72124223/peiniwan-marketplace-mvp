import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-grid">
        <div>
          <Link className="brand" href="/">狼群<span aria-hidden>。</span></Link>
          <p>想放鬆、想聊天，或想把遊戲練好一點，都可以先看看有沒有合拍的人。</p>
          <small>目前是示範網站。送出需求不會扣款，也不會自動成立訂單。</small>
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
        </div>
      </div>
      <div className="section-shell footer-bottom">
        <span>© 2026 狼群</span>
        <span>18+・示範資料</span>
      </div>
    </footer>
  );
}
