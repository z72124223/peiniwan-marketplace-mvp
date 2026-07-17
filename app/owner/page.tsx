import type { Metadata } from "next";
import Link from "next/link";
import { OwnerDashboard } from "@/components/owner-dashboard";

export const metadata: Metadata = {
  title: "Owner 營運骨架",
  description: "陪你玩私密 MVP 的陪玩師審核、人工派單與客服爭議工作台。",
  robots: { index: false, follow: false },
};

export default function OwnerPage() {
  return (
    <main className="owner-page section-shell">
      <header className="owner-page-header">
        <div>
          <span className="eyebrow">OWNER OPERATIONS</span>
          <h1>一個人，也能把信任做紮實。</h1>
          <p>把申請審核、人工派單、客服與爭議集中在同一個可追蹤工作台。</p>
        </div>
        <Link className="button button-quiet" href="/">返回前台</Link>
      </header>
      <OwnerDashboard />
    </main>
  );
}
