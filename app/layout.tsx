import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const localHost = host?.startsWith("localhost") || host?.startsWith("127.0.0.1");
  const protocol = forwardedProtocol ?? (localHost ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : "https://peiniwan-marketplace-v02.z72124223.chatgpt.site";
  const socialImage = `${origin}/og-peiniwan-audit-v3.png`;

  return {
    title: {
      default: "陪你玩｜找到今晚合拍的人",
      template: "%s｜陪你玩",
    },
    description: "找個合拍的遊戲隊友：想放鬆、想聊天，或想認真練一局都可以先看看。",
    openGraph: {
      title: "陪你玩｜找到今晚合拍的人",
      description: "想輕鬆打幾場、找人聊天，還是認真練一局？先看看人，覺得對再約。",
      locale: "zh_TW",
      type: "website",
      images: [{ url: socialImage, width: 1731, height: 909, alt: "陪你玩・今晚找個合拍的隊友" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "陪你玩｜找到今晚合拍的人",
      description: "想輕鬆打幾場、找人聊天，還是認真練一局？先看看人，覺得對再約。",
      images: [socialImage],
    },
  };
}

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
