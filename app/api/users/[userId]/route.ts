import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import type { UserStats } from "@/lib/types";

/**
 * 사용자 정보 조회 API
 *
 * GET /api/users/[userId]
 * - user_stats 뷰를 사용하여 사용자 통계 정보 조회
 * - 게시물 수, 팔로워 수, 팔로잉 수 포함
 *
 * @example
 * GET /api/users/xxx-xxx-xxx
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
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
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 현재 사용자가 이 사용자를 팔로우하는지 확인 (인증된 경우만)
    const { userId: clerkUserId } = await auth();
    let isFollowing = false;

    if (clerkUserId) {
      // Clerk userId로 Supabase users 테이블에서 user_id 찾기
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (currentUserData && currentUserData.id !== userId) {
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

    // 응답 데이터 구성
    const user: UserStats & { is_following?: boolean } = {
      user_id: userStats.user_id,
      clerk_id: userStats.clerk_id,
      name: userStats.name,
      posts_count: userStats.posts_count || 0,
      followers_count: userStats.followers_count || 0,
      following_count: userStats.following_count || 0,
      is_following: isFollowing,
    };

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("[User Profile] API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

