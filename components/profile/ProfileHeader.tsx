/**
 * @file ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * Instagram 스타일의 프로필 헤더입니다.
 * - 프로필 이미지 (150px Desktop / 90px Mobile)
 * - 사용자명
 * - 통계 (게시물 수, 팔로워 수, 팔로잉 수)
 * - "팔로우" / "팔로잉" 버튼 (다른 사람 프로필)
 * - "프로필 편집" 버튼 (본인 프로필, 1차 제외)
 *
 * @see {@link docs/PRD.md} - 프로필 페이지 요구사항 (섹션 7.5)
 */

"use client";

import { useState } from "react";
import { UserAvatar } from "@clerk/nextjs";
import type { UserStats } from "@/lib/types";
import FollowButton from "./FollowButton";

interface ProfileHeaderProps {
  user: UserStats & { is_following?: boolean };
  isOwnProfile: boolean;
}

/**
 * ProfileHeader 컴포넌트
 *
 * @param user - 사용자 통계 정보
 * @param isOwnProfile - 본인 프로필 여부
 */
export default function ProfileHeader({
  user: initialUser,
  isOwnProfile,
}: ProfileHeaderProps) {
  const [followersCount, setFollowersCount] = useState(initialUser.followers_count || 0);

  // 팔로우 상태 변경 핸들러 (FollowButton에서 호출)
  const handleFollowChange = (isFollowing: boolean) => {
    // 팔로워 수 낙관적 업데이트
    setFollowersCount((prev) => (isFollowing ? prev + 1 : prev - 1));
  };

  return (
    <div className="px-4 py-6 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
        {/* 프로필 이미지 */}
        <div className="flex justify-center md:justify-start">
          <UserAvatar
            userId={initialUser.clerk_id}
            size={90}
            className="md:w-[150px] md:h-[150px] rounded-full"
          />
        </div>

        {/* 사용자 정보 */}
        <div className="flex-1 space-y-4">
          {/* 사용자명 */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-xl md:text-2xl font-light text-[#262626]">
              {initialUser.name}
            </h1>

            {/* 버튼 영역 */}
            {isOwnProfile ? (
              // 본인 프로필: 프로필 편집 버튼 (1차 제외, UI만)
              <button
                type="button"
                className="px-4 py-1.5 text-sm font-semibold border border-[#DBDBDB] rounded-md text-[#262626] hover:bg-[#FAFAFA] transition-colors"
                disabled
                aria-label="프로필 편집"
              >
                프로필 편집
              </button>
            ) : (
              // 다른 사람 프로필: 팔로우/팔로잉 버튼
              <FollowButton
                userId={initialUser.user_id}
                initialIsFollowing={initialUser.is_following || false}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-6 md:gap-8">
            {/* 게시물 수 */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[#262626]">
                {initialUser.posts_count.toLocaleString()}
              </span>
              <span className="text-[#262626]">게시물</span>
            </div>

            {/* 팔로워 수 */}
            <button
              type="button"
              className="flex items-center gap-1 hover:opacity-50 transition-opacity"
              aria-label="팔로워"
            >
              <span className="font-semibold text-[#262626]">
                {followersCount.toLocaleString()}
              </span>
              <span className="text-[#262626]">팔로워</span>
            </button>

            {/* 팔로잉 수 */}
            <button
              type="button"
              className="flex items-center gap-1 hover:opacity-50 transition-opacity"
              aria-label="팔로잉"
            >
              <span className="font-semibold text-[#262626]">
                {initialUser.following_count.toLocaleString()}
              </span>
              <span className="text-[#262626]">팔로잉</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

