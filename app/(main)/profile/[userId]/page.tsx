/**
 * @file page.tsx
 * @description 프로필 페이지
 *
 * 사용자 프로필을 표시하는 동적 라우트 페이지입니다.
 * - ProfileHeader: 프로필 이미지, 사용자명, 통계, 팔로우 버튼
 * - PostGrid: 사용자의 게시물 그리드 (3열)
 *
 * @see {@link docs/PRD.md} - 프로필 페이지 요구사항 (섹션 7.5)
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostGrid from "@/components/profile/PostGrid";
import type { UserStats } from "@/lib/types";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

/**
 * 프로필 페이지 컴포넌트
 *
 * @param params - 동적 라우트 파라미터 (userId)
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  // user_stats 뷰에서 사용자 정보 조회
  const { data: userStats, error: userError } = await supabase
    .from("user_stats")
    .select("user_id, clerk_id, name, posts_count, followers_count, following_count")
    .eq("user_id", userId)
    .single();

  if (userError || !userStats) {
    console.error("User stats query error:", userError);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
        <p className="text-[#8e8e8e]">사용자를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 현재 사용자 확인 (본인 프로필 여부 및 팔로우 상태)
  const { userId: clerkUserId } = await auth();
  let isOwnProfile = false;
  let isFollowing = false;

  if (clerkUserId) {
    const { data: currentUserData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (currentUserData) {
      if (currentUserData.id === userId) {
        isOwnProfile = true;
      } else {
        // 현재 사용자가 이 사용자를 팔로우하는지 확인
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserData.id)
          .eq("following_id", userId)
          .single();

        if (followData) {
          isFollowing = true;
        }
      }
    }
  }

  const user: UserStats & { is_following?: boolean } = {
    ...userStats,
    is_following: isFollowing,
  };

  return (
    <div className="max-w-[935px] mx-auto px-4 py-6 md:py-12">
      {/* 프로필 헤더 */}
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

      {/* 게시물 그리드 */}
      <div className="mt-8 md:mt-12">
        <PostGrid userId={userId} />
      </div>
    </div>
  );
}

