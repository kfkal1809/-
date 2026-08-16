import type { Metadata, Viewport } from "next";
import { Gowun_Dodum } from "next/font/google";
import { AudioBootstrap } from "@/components/audio/AudioBootstrap";
import { BgmController } from "@/components/audio/BgmController";
import "./globals.css";

// 기존 서체(Pretendard)보다 살짝 동글동글한 인상을 주는 한글 서체 — globals.css의
// `--font-body` 변수를 실제로 채워준다(이전엔 변수만 있고 실제 폰트 로드가 없었음).
const fontBody = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "해기사와 연인들의 항해일지",
  description: "해연결호에서 함께 승선하는 커플·가족 생활 게임",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "해연결 항해일지",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#eaf6ff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full antialiased ${fontBody.variable}`}>
      <body className="min-h-full flex flex-col">
        <AudioBootstrap />
        <BgmController />
        {children}
      </body>
    </html>
  );
}
