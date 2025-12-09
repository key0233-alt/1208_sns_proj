/**
 * @file BottomNav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 *
 * Mobile (<768px)에서만 표시되는 하단 네비게이션입니다.
 * - 높이: 50px 고정
 * - 5개 아이콘 버튼: 홈, 검색, 만들기, 좋아요, 프로필
 * - Active 상태: 현재 경로와 일치 시 아이콘 색상 변경
 *
 * @see {@link docs/PRD.md} - 레이아웃 구조 요구사항
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import CreatePostModal from "@/components/post/CreatePostModal";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
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
      href: "/activity",
      icon: Heart,
      label: "좋아요",
    },
    {
      href: user ? "/profile" : "/sign-in",
      icon: User,
      label: "프로필",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#DBDBDB] z-50 flex items-center justify-around">
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
              flex items-center justify-center p-2
              transition-colors duration-200
              ${
                isActive
                  ? "text-[#262626]"
                  : "text-[#8E8E8E] hover:text-[#262626]"
              }
            `}
            aria-label={item.label}
          >
            <Icon
              className={`w-6 h-6 ${
                isActive ? "stroke-[2.5]" : "stroke-2"
              }`}
            />
          </Link>
        );
      })}

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </nav>
  );
}

