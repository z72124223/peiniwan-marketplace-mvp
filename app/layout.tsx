import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "陪你玩｜找到今晚合拍的人",
    template: "%s｜陪你玩",
  },
  description: "以遊戲為入口的 18+ 線上娛樂、語音陪伴與技術服務市場。",
  openGraph: {
    title: "陪你玩｜找到今晚合拍的人",
    description: "想輕鬆打幾場、找人聊天，還是認真練一局？先看看人，覺得對再約。",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "陪你玩｜找到今晚合拍的人",
    description: "想輕鬆打幾場、找人聊天，還是認真練一局？先看看人，覺得對再約。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
