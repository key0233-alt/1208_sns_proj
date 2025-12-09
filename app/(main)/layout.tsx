/**
 * @file layout.tsx
 * @description 메인 앱 레이아웃 (Sidebar + Main Content)
 *
 * Instagram 스타일의 반응형 레이아웃을 제공합니다.
 * - Desktop (≥1024px): Sidebar(244px) + Main Feed(최대 630px, 중앙 정렬)
 * - Tablet (768px~1023px): Icon-only Sidebar(72px) + Main Feed
 * - Mobile (<768px): Header(60px) + Main Feed + BottomNav(50px)
 *
 * @see {@link docs/PRD.md} - 레이아웃 구조 요구사항
 */

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop/Tablet: Sidebar */}
      <Sidebar />

      {/* Mobile: Header */}
      <Header />

      {/* Main Content */}
      <main className="md:pl-[72px] lg:pl-[244px] pt-[60px] md:pt-0 pb-[50px] md:pb-0 min-h-screen">
        <div className="max-w-[630px] mx-auto px-4">{children}</div>
      </main>

      {/* Mobile: BottomNav */}
      <BottomNav />
    </div>
  );
}

