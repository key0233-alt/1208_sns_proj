import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PostListResponse } from "@/lib/types";

/**
 * 게시물 목록 조회 API
 *
 * GET /api/posts
 * - 게시물 목록을 시간 역순으로 조회
 * - 페이지네이션 지원 (limit, offset)
 * - 선택적 userId 파라미터 (프로필 페이지용 필터링)
 *
 * Query Parameters:
 * - limit: 페이지 크기 (기본값: 10)
 * - offset: 오프셋 (기본값: 0)
 * - userId: 특정 사용자의 게시물만 조회 (선택사항)
 *
 * @example
 * GET /api/posts?limit=10&offset=0
 * GET /api/posts?userId=xxx&limit=10&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // 쿼리 파라미터 파싱
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const userId = searchParams.get("userId");

    // limit 검증
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      );
    }

    // post_stats 뷰에서 게시물 목록 조회
    let query = supabase
      .from("post_stats")
      .select("post_id, user_id, image_url, caption, created_at, likes_count, comments_count", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // userId 필터링 (프로필 페이지용)
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: postsData, error: postsError, count } = await query;

    if (postsError) {
      console.error("Posts query error:", postsError);
      return NextResponse.json(
        { error: "Failed to fetch posts", details: postsError.message },
        { status: 500 }
      );
    }

    if (!postsData || postsData.length === 0) {
      return NextResponse.json({
        posts: [],
        total: count || 0,
        hasMore: false,
      } satisfies PostListResponse);
    }

    // 작성자 정보 조회 (user_id 목록)
    const userIds = [...new Set(postsData.map((post) => post.user_id))];
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, clerk_id, name")
      .in("id", userIds);

    if (usersError) {
      console.error("Users query error:", usersError);
      // 사용자 정보 조회 실패해도 게시물은 반환
    }

    // 사용자 정보를 Map으로 변환 (빠른 조회를 위해)
    const usersMap = new Map<string, { id: string; clerk_id: string; name: string }>();
    if (usersData) {
      for (const user of usersData) {
        usersMap.set(user.id, user);
      }
    }

    // 각 게시물의 최신 댓글 2개 조회
    const postIds = postsData.map((post) => post.post_id);
    
    // 댓글 조회 (users 관계 없이 먼저 조회)
    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select("id, post_id, user_id, content, created_at, updated_at")
      .in("post_id", postIds)
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.error("Comments query error:", commentsError);
      // 댓글 조회 실패해도 게시물은 반환
    }

    // 댓글을 post_id별로 그룹화하고 최신 2개만 선택
    const commentsByPostId = new Map<
      string,
      Array<{
        id: string;
        post_id: string;
        user_id: string;
        content: string;
        created_at: string;
        updated_at: string;
      }>
    >();
    
    if (commentsData) {
      for (const comment of commentsData) {
        const postId = comment.post_id;
        if (!commentsByPostId.has(postId)) {
          commentsByPostId.set(postId, []);
        }
        const postComments = commentsByPostId.get(postId)!;
        if (postComments.length < 2) {
          postComments.push(comment);
        }
      }
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

    const commentUsersMap = new Map<string, { id: string; clerk_id: string; name: string }>();
    if (commentUsersData) {
      for (const user of commentUsersData) {
        commentUsersMap.set(user.id, user);
      }
    }

    // 응답 데이터 형식 변환
    const posts = postsData.map((post) => {
      const user = usersMap.get(post.user_id);
      const comments = commentsByPostId.get(post.post_id) || [];

      return {
        post_id: post.post_id,
        user_id: post.user_id,
        image_url: post.image_url,
        caption: post.caption,
        created_at: post.created_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        user_name: user?.name || "Unknown",
        user_clerk_id: user?.clerk_id || "",
        comments: comments.map((comment) => {
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
        }),
      };
    });

    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      posts,
      total,
      hasMore,
    } satisfies PostListResponse);
  } catch (error) {
    console.error("Posts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

