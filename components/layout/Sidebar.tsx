/**
 * @file Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * 반응형 동작:
 * - Desktop (≥1024px): 244px 너비, 아이콘 + 텍스트 표시
 * - Tablet (768px~1023px): 72px 너비, 아이콘만 표시
 * - Mobile (<768px): 숨김
 *
 * 메뉴 항목:
 * - 홈 (/)
 * - 검색 (/search) - UI만 (1차 제외)
 * - 만들기 (/create) - 모달 열기
 * - 프로필 (/profile)
 *
 * @see {@link docs/PRD.md} - 레이아웃 구조 요구사항
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import CreatePostModal from "@/components/post/CreatePostModal";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      href: "/",
      icon: Home,
      label: "홈",
    },
    {
      href: "/search",
      icon: Search,
      label: "검색",
    },
    {
      href: "#",
      icon: Plus,
      label: "만들기",
      onClick: (e) => {
        e.preventDefault();
        setIsCreateModalOpen(true);
      },
    },
    {
      href: user ? "/profile" : "/sign-in",
      icon: User,
      label: "프로필",
    },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full bg-white border-r border-[#DBDBDB] flex-col z-40">
      {/* Desktop: 244px, Tablet: 72px */}
      <div className="w-[72px] lg:w-[244px] pt-8 px-4">
        {/* 로고/브랜드명 (Desktop만 표시) */}
        <div className="hidden lg:block mb-8 px-2">
          <h1 className="text-xl font-bold text-[#262626]">Instagram</h1>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // 프로필의 경우 /profile로 시작하는 모든 경로를 활성화
            const isActive =
              item.href === "/profile"
                ? pathname.startsWith("/profile")
                : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.onClick}
                className={`
                  flex items-center gap-4 px-3 py-3 rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#0095f6] focus:ring-offset-2
                  ${
                    isActive
                      ? "font-bold text-[#262626]"
                      : "text-[#262626] hover:bg-gray-50"
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "stroke-[2.5]" : "stroke-2"
                  }`}
                />
                {/* Desktop만 텍스트 표시 */}
                <span className="hidden lg:inline text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </aside>
  );
}

