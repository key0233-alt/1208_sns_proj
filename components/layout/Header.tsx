/**
 * @file Header.tsx
 * @description 상단 헤더 컴포넌트
 *
 * 모든 화면 크기에서 표시되는 상단 헤더입니다.
 * - Mobile (<768px): 전체 너비, 로고 + 사용자 정보 + 아이콘들
 * - Desktop/Tablet (≥768px): Sidebar 오른쪽, 오른쪽 상단에 사용자 정보
 * - 높이: 60px 고정
 *
 * @see {@link docs/PRD.md} - 레이아웃 구조 요구사항
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, User, LogOut } from "lucide-react";
import { useUser, UserAvatar, useClerk, SignInButton } from "@clerk/nextjs";

export default function Header() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  // Mobile 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Desktop 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!isDesktopMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopMenuOpen]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      setIsMobileMenuOpen(false);
      setIsDesktopMenuOpen(false);
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#DBDBDB] z-50 flex items-center justify-between px-4">
        {/* 좌측: 로고 */}
        <Link href="/" className="text-xl font-bold text-[#262626]">
          Instagram
        </Link>

        {/* 우측: 아이콘들 및 사용자 정보 */}
        <div className="flex items-center gap-3">
          {/* 로그인한 사용자 정보 (Mobile) */}
          {isLoaded && user ? (
            <div className="relative" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                aria-label="사용자 메뉴"
                aria-expanded={isMobileMenuOpen}
                aria-haspopup="true"
              >
                <UserAvatar
                  {...({ userId: user.id } as any)}
                  size={24}
                  className="rounded-full"
                />
                <span className="text-sm font-semibold text-[#262626] hidden sm:inline truncate max-w-[100px]">
                  {user.fullName ||
                    user.username ||
                    user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
                    "사용자"}
                </span>
              </button>

              {/* 드롭다운 메뉴 */}
              {isMobileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 bg-white border border-[#DBDBDB] rounded-md shadow-lg z-50 min-w-[160px]"
                  role="menu"
                  aria-label="사용자 메뉴"
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-sm text-[#262626] hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    프로필
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : isLoaded ? (
            // 로그인하지 않은 경우 로그인 버튼 표시
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold bg-[#0095f6] text-white rounded-md hover:bg-[#0095f6]/90 transition-colors"
                aria-label="로그인"
              >
                로그인
              </button>
            </SignInButton>
          ) : null}
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

      {/* Desktop/Tablet Header (오른쪽 상단) */}
      <header className="hidden md:flex fixed top-0 h-[60px] bg-white border-b border-[#DBDBDB] z-40 items-center justify-end px-6 left-[72px] lg:left-[244px] right-0">
        {/* 오른쪽: 사용자 정보 */}
        <div className="flex items-center gap-4">
          {isLoaded && user ? (
            <div className="relative" ref={desktopMenuRef}>
              <button
                type="button"
                onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="사용자 메뉴"
                aria-expanded={isDesktopMenuOpen}
                aria-haspopup="true"
              >
                <UserAvatar
                  {...({ userId: user.id } as any)}
                  size={32}
                  className="rounded-full"
                />
                <span className="text-sm font-semibold text-[#262626] hidden lg:inline">
                  {user.fullName ||
                    user.username ||
                    user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
                    "사용자"}
                </span>
              </button>

              {/* 드롭다운 메뉴 */}
              {isDesktopMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 bg-white border border-[#DBDBDB] rounded-md shadow-lg z-50 min-w-[160px]"
                  role="menu"
                  aria-label="사용자 메뉴"
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-sm text-[#262626] hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDesktopMenuOpen(false)}
                    role="menuitem"
                  >
                    프로필
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : isLoaded ? (
            // 로그인하지 않은 경우 로그인 버튼 표시
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold bg-[#0095f6] text-white rounded-md hover:bg-[#0095f6]/90 transition-colors"
                aria-label="로그인"
              >
                로그인
              </button>
            </SignInButton>
          ) : null}
        </div>
      </header>
    </>
  );
}



