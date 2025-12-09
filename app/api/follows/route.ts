import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 팔로우 추가 API
 *
 * POST /api/follows
 * - 팔로우 관계 추가
 * - 인증 검증 (Clerk)
 * - 자기 자신 팔로우 방지
 *
 * Body:
 * - followingId: 팔로우할 사용자 ID (UUID)
 *
 * @example
 * POST /api/follows
 * Body: { "followingId": "xxx-xxx-xxx" }
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Clerk userId로 Supabase users 테이블에서 user_id 찾기
    const { data: currentUserData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !currentUserData) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json().catch(() => ({}));
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId is required" },
        { status: 400 }
      );
    }

    // 자기 자신 팔로우 방지
    if (currentUserData.id === followingId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // 팔로우할 사용자 존재 확인
    const { data: targetUserData, error: targetUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", followingId)
      .single();

    if (targetUserError || !targetUserData) {
      return NextResponse.json(
        { error: "User to follow not found" },
        { status: 404 }
      );
    }

    // 팔로우 관계 추가
    const { data: followData, error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: currentUserData.id,
        following_id: followingId,
      })
      .select()
      .single();

    if (followError) {
      // 중복 팔로우 에러 처리
      if (followError.code === "23505") {
        return NextResponse.json(
          { error: "Already following this user" },
          { status: 409 }
        );
      }

      console.error("Follow insert error:", followError);
      return NextResponse.json(
        { error: "Failed to follow user", details: followError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      follow: followData,
    });
  } catch (error) {
    console.error("[Follow] POST API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * 팔로우 제거 API
 *
 * DELETE /api/follows
 * - 팔로우 관계 제거
 * - 인증 검증 (Clerk)
 *
 * Body:
 * - followingId: 언팔로우할 사용자 ID (UUID)
 *
 * @example
 * DELETE /api/follows
 * Body: { "followingId": "xxx-xxx-xxx" }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Clerk userId로 Supabase users 테이블에서 user_id 찾기
    const { data: currentUserData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !currentUserData) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json().catch(() => ({}));
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId is required" },
        { status: 400 }
      );
    }

    // 팔로우 관계 제거
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserData.id)
      .eq("following_id", followingId);

    if (deleteError) {
      console.error("Follow delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to unfollow user", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[Unfollow] DELETE API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

