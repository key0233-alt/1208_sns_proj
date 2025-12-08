import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Clerk 한국어 로컬라이제이션 설정
 * 
 * 공식 문서: https://clerk.com/docs/guides/customizing-clerk/localization
 * 
 * koKR을 기반으로 하되, 필요시 특정 텍스트를 커스터마이징할 수 있습니다.
 * 예: signUp.start.subtitle, formButtonPrimary, unstable__errors 등
 */
const koreanLocalization = {
  ...koKR,
  // 필요시 특정 텍스트를 커스터마이징할 수 있습니다
  // 예시:
  // signUp: {
  //   start: {
  //     subtitle: "{{applicationName}}에 가입하여 계속하세요",
  //   },
  // },
  // formButtonPrimary: "계속하기",
};

export const metadata: Metadata = {
  title: "SaaS 템플릿",
  description: "Next.js + Clerk + Supabase 보일러플레이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koreanLocalization}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
