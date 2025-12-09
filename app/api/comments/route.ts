import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 댓글 작성/삭제 API
 *
 * POST /api/comments
 * - 게시물에 댓글 작성
 *
 * DELETE /api/comments
 * - 댓글 삭제 (본인만 가능)
 *
 * Body (POST):
 * - post_id: 게시물 ID (UUID)
 * - content: 댓글 내용
 *
 * Query (DELETE):
 * - commentId: 댓글 ID (UUID)
 *
 * @example
 * POST /api/comments
 * Body: { "post_id": "xxx", "content": "댓글 내용" }
 *
 * DELETE /api/comments?commentId=xxx
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { post_id, content } = body;

    // 유효성 검증
    if (!post_id) {
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "content is required and cannot be empty" },
        { status: 400 }
      );
    }

    // 댓글 내용 길이 제한 (선택사항, 필요시 추가)
    const MAX_COMMENT_LENGTH = 1000;
    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 게시물 존재 확인
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", post_id)
      .single();

    if (postError || !postData) {
      console.error("Post lookup error:", postError);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

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

    // 댓글 추가
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: post_id,
        user_id: userData.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Comment insert error:", error);
      return NextResponse.json(
        { error: "Failed to create comment", details: error.message },
        { status: 500 }
      );
    }

    // 댓글 작성자 정보 조회
    const { data: commentUserData } = await supabase
      .from("users")
      .select("id, clerk_id, name")
      .eq("id", userData.id)
      .single();

    // 응답 데이터 구성
    const commentWithUser = {
      ...data,
      user_name: commentUserData?.name || "Unknown",
      user_clerk_id: commentUserData?.clerk_id || "",
    };

    return NextResponse.json({
      success: true,
      comment: commentWithUser,
    });
  } catch (error) {
    console.error("Comment API error:", error);
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
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId is required" },
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

    // 댓글 존재 및 소유자 확인
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("id, user_id")
      .eq("id", commentId)
      .single();

    if (commentError || !commentData) {
      console.error("Comment lookup error:", commentError);
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // 본인 댓글인지 확인
    if (commentData.user_id !== userData.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own comments" },
        { status: 403 }
      );
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userData.id);

    if (deleteError) {
      console.error("Comment delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete comment", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Comment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

