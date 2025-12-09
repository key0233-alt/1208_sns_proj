import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { PostStatsWithUser } from "@/lib/types";

/**
 * 단일 게시물 상세 조회 API
 *
 * GET /api/posts/[postId]
 * - 게시물 상세 정보 조회
 * - 전체 댓글 목록 포함
 * - 현재 사용자의 좋아요 상태 포함
 *
 * @example
 * GET /api/posts/xxx-xxx-xxx
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = await createClient();

    // post_stats 뷰에서 게시물 정보 조회
    const { data: postData, error: postError } = await supabase
      .from("post_stats")
      .select("post_id, user_id, image_url, caption, created_at, likes_count, comments_count")
      .eq("post_id", postId)
      .single();

    if (postError || !postData) {
      console.error("Post query error:", postError);
      return NextResponse.json(
        { error: "Post not found", details: postError?.message },
        { status: 404 }
      );
    }

    // 작성자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name")
      .eq("id", postData.user_id)
      .single();

    if (userError || !userData) {
      console.error("User query error:", userError);
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 전체 댓글 목록 조회 (최신순, 제한 없음)
    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select("id, post_id, user_id, content, created_at, updated_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true }); // 오래된 것부터 (스크롤 시 자연스러움)

    if (commentsError) {
      console.error("Comments query error:", commentsError);
      // 댓글 조회 실패해도 게시물은 반환
    }

    // 댓글 작성자 정보 조회
    const commentUserIds = new Set<string>();
    if (commentsData) {
      for (const comment of commentsData) {
        commentUserIds.add(comment.user_id);
      }
    }

    const { data: commentUsersData } = await supabase
      .from("users")
      .select("id, clerk_id, name")
      .in("id", Array.from(commentUserIds));

    const commentUsersMap = new Map<
      string,
      { id: string; clerk_id: string; name: string }
    >();
    if (commentUsersData) {
      for (const user of commentUsersData) {
        commentUsersMap.set(user.id, user);
      }
    }

    // 현재 사용자의 좋아요 상태 조회 (인증된 경우만)
    const { userId: clerkUserId } = await auth();
    let isLiked = false;

    if (clerkUserId) {
      // Clerk userId로 Supabase users 테이블에서 user_id 찾기
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (currentUserData) {
        // 현재 사용자가 좋아요한 게시물인지 확인
        const { data: likeData } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", currentUserData.id)
          .single();

        if (likeData) {
          isLiked = true;
        }
      }
    }

    // 댓글 데이터 형식 변환
    const comments = (commentsData || []).map((comment) => {
      const commentUser = commentUsersMap.get(comment.user_id);
      return {
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user_name: commentUser?.name || "Unknown",
        user_clerk_id: commentUser?.clerk_id || "",
      };
    });

    // 응답 데이터 구성
    const post: PostStatsWithUser = {
      post_id: postData.post_id,
      user_id: postData.user_id,
      image_url: postData.image_url,
      caption: postData.caption,
      created_at: postData.created_at,
      likes_count: postData.likes_count || 0,
      comments_count: postData.comments_count || 0,
      user_name: userData.name,
      user_clerk_id: userData.clerk_id,
      comments: comments,
      is_liked: isLiked,
    };

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("[Post Detail] API error:", error);
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
 * 게시물 삭제 API
 *
 * DELETE /api/posts/[postId]
 * - 게시물 삭제 (본인만 가능)
 * - Supabase Storage에서 이미지 삭제
 * - posts 테이블에서 게시물 삭제 (CASCADE로 관련 데이터 자동 삭제)
 * - 인증 검증 (Clerk)
 *
 * @example
 * DELETE /api/posts/xxx-xxx-xxx
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
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

    // 게시물 정보 조회 (작성자 확인 및 이미지 URL 가져오기)
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, image_url")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      console.error("Post query error:", postError);
      return NextResponse.json(
        { error: "Post not found", details: postError?.message },
        { status: 404 }
      );
    }

    // 본인 게시물인지 확인
    if (postData.user_id !== currentUserData.id) {
      return NextResponse.json(
        { error: "You can only delete your own posts" },
        { status: 403 }
      );
    }

    // Service Role 클라이언트로 Storage 삭제 (RLS 우회)
    let serviceRoleSupabase;
    try {
      serviceRoleSupabase = getServiceRoleClient();
    } catch (error) {
      console.error("[Post Delete] Service Role client error:", error);
      return NextResponse.json(
        {
          error: "Storage service configuration error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Storage에서 이미지 삭제
    // image_url에서 파일 경로 추출 (예: https://xxx.supabase.co/storage/v1/object/public/posts/user_id/filename.jpg)
    const imageUrl = postData.image_url;
    const urlParts = imageUrl.split("/posts/");
    if (urlParts.length > 1) {
      const filePath = `posts/${urlParts[1]}`;
      const { error: storageError } = await serviceRoleSupabase.storage
        .from("posts")
        .remove([filePath]);

      if (storageError) {
        console.error("[Post Delete] Storage delete error:", storageError);
        // Storage 삭제 실패해도 게시물은 삭제 진행 (이미지가 없어도 게시물 삭제는 가능)
      }
    }

    // posts 테이블에서 게시물 삭제 (CASCADE로 likes, comments 자동 삭제)
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      console.error("Post delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete post", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("[Post Delete] API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

