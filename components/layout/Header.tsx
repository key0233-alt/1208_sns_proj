/**
 * @file Header.tsx
 * @description Mobile 전용 헤더 컴포넌트
 *
 * Mobile (<768px)에서만 표시되는 상단 헤더입니다.
 * - 높이: 60px 고정
 * - 좌측: 로고/브랜드명
 * - 우측: 알림, DM, 프로필 아이콘 (1차 제외, UI만)
 *
 * @see {@link docs/PRD.md} - 레이아웃 구조 요구사항
 */

"use client";

import Link from "next/link";
import { Bell, MessageCircle, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function Header() {
  const { user } = useUser();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#DBDBDB] z-50 flex items-center justify-between px-4">
      {/* 좌측: 로고 */}
      <Link href="/" className="text-xl font-bold text-[#262626]">
        Instagram
      </Link>

      {/* 우측: 아이콘들 */}
      <div className="flex items-center gap-4">
        {/* 알림 (1차 제외, UI만) */}
        <button
          type="button"
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="알림"
        >
          <Bell className="w-6 h-6 text-[#262626]" />
        </button>

        {/* DM (1차 제외, UI만) */}
        <button
          type="button"
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="메시지"
        >
          <MessageCircle className="w-6 h-6 text-[#262626]" />
        </button>

        {/* 프로필 */}
        <Link
          href={user ? "/profile" : "/sign-in"}
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="프로필"
        >
          <User className="w-6 h-6 text-[#262626]" />
        </Link>
      </div>
    </header>
  );
}

