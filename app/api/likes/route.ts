import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 좋아요 추가/제거 API
 *
 * POST /api/likes
 * - 게시물에 좋아요 추가
 *
 * DELETE /api/likes
 * - 게시물 좋아요 제거
 *
 * Body:
 * - postId: 게시물 ID (UUID)
 *
 * @example
 * POST /api/likes
 * Body: { "postId": "xxx" }
 *
 * DELETE /api/likes?postId=xxx
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Clerk userId로 Supabase users 테이블에서 user_id 찾기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 좋아요 추가
    const { data, error } = await supabase
      .from("likes")
      .insert({
        post_id: postId,
        user_id: userData.id,
      })
      .select()
      .single();

    if (error) {
      // 중복 좋아요 에러 처리
      if (error.code === "23505") {
        // UNIQUE constraint violation
        return NextResponse.json(
          { error: "Already liked" },
          { status: 409 }
        );
      }

      console.error("Like insert error:", error);
      return NextResponse.json(
        { error: "Failed to add like", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      like: data,
    });
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Clerk userId로 Supabase users 테이블에서 user_id 찾기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 좋아요 제거
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userData.id);

    if (error) {
      console.error("Like delete error:", error);
      return NextResponse.json(
        { error: "Failed to remove like", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

