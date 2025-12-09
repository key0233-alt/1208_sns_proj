import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
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
        { status: 400 },
      );
    }

    // post_stats 뷰에서 게시물 목록 조회
    let query = supabase
      .from("post_stats")
      .select(
        "post_id, user_id, image_url, caption, created_at, likes_count, comments_count",
        {
          count: "exact",
        },
      )
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
        { status: 500 },
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
    const usersMap = new Map<
      string,
      { id: string; clerk_id: string; name: string }
    >();
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
    let likedPostIds = new Set<string>();

    if (clerkUserId) {
      // Clerk userId로 Supabase users 테이블에서 user_id 찾기
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (currentUserData) {
        // 현재 사용자가 좋아요한 게시물 ID 목록 조회
        const { data: likesData } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", currentUserData.id)
          .in("post_id", postIds);

        if (likesData) {
          likedPostIds = new Set(likesData.map((like) => like.post_id));
        }
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
        is_liked: likedPostIds.has(post.post_id),
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
      { status: 500 },
    );
  }
}

/**
 * 게시물 생성 API
 *
 * POST /api/posts
 * - 이미지 파일 업로드 (Supabase Storage)
 * - 게시물 데이터 저장 (posts 테이블)
 * - 인증 검증 (Clerk)
 *
 * Body (FormData):
 * - image: 이미지 파일 (필수, 최대 5MB)
 * - caption: 캡션 (선택사항, 최대 2,200자)
 *
 * @example
 * POST /api/posts
 * Body: FormData with image file and optional caption
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const caption = formData.get("caption") as string | null;

    // 이미지 파일 검증
    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 },
      );
    }

    // 파일 타입 검증
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
        },
        { status: 400 },
      );
    }

    // 파일 크기 검증 (최대 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds 5MB limit. Current size: ${(
            imageFile.size /
            1024 /
            1024
          ).toFixed(2)}MB`,
        },
        { status: 400 },
      );
    }

    // 캡션 길이 검증 (최대 2,200자)
    const MAX_CAPTION_LENGTH = 2200;
    if (caption && caption.length > MAX_CAPTION_LENGTH) {
      return NextResponse.json(
        {
          error: `Caption exceeds ${MAX_CAPTION_LENGTH} characters limit.`,
        },
        { status: 400 },
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
        { status: 404 },
      );
    }

    // Service Role 클라이언트로 Storage 업로드 (RLS 우회)
    let serviceRoleSupabase;
    try {
      serviceRoleSupabase = getServiceRoleClient();
    } catch (error) {
      console.error("[Post Upload] Service Role client error:", error);
      return NextResponse.json(
        {
          error: "Storage service configuration error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }

    // 버킷 존재 여부 확인 (선택사항, 에러 발생 시 더 명확한 메시지 제공)
    const { data: buckets, error: bucketError } =
      await serviceRoleSupabase.storage.listBuckets();

    if (bucketError) {
      console.error("[Post Upload] Bucket list error:", bucketError);
    } else {
      const postsBucketExists = buckets?.some((b) => b.id === "posts");
      if (!postsBucketExists) {
        console.error(
          "[Post Upload] 'posts' bucket not found. Available buckets:",
          buckets?.map((b) => b.id),
        );
        return NextResponse.json(
          {
            error: "Storage bucket 'posts' not found",
            details:
              "Please create the 'posts' bucket in Supabase Dashboard → Storage",
            availableBuckets: buckets?.map((b) => b.id) || [],
          },
          { status: 500 },
        );
      }
    }

    // 파일명 생성: {user_id}/{timestamp}-{random}.{ext}
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${userData.id}/${timestamp}-${random}.${fileExt}`;

    // Supabase Storage에 이미지 업로드 (posts 버킷)
    console.log("[Post Upload] Starting upload:", {
      fileName,
      fileSize: imageFile.size,
      fileType: imageFile.type,
      userId: userData.id,
    });

    const { data: uploadData, error: uploadError } =
      await serviceRoleSupabase.storage
        .from("posts")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error("[Post Upload] Storage upload error:", {
        error: uploadError,
        code: uploadError.statusCode,
        message: uploadError.message,
        fileName,
      });

      // 버킷이 없는 경우를 위한 더 자세한 에러 메시지
      if (
        uploadError.message?.includes("Bucket not found") ||
        uploadError.statusCode === "404"
      ) {
        return NextResponse.json(
          {
            error:
              "Storage bucket 'posts' not found. Please create the bucket in Supabase Dashboard.",
            details: uploadError.message,
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to upload image",
          details: uploadError.message || "Unknown storage error",
          code: uploadError.statusCode,
        },
        { status: 500 },
      );
    }

    console.log("[Post Upload] Upload successful:", uploadData);

    // Public URL 가져오기
    const {
      data: { publicUrl },
    } = serviceRoleSupabase.storage.from("posts").getPublicUrl(fileName);

    // posts 테이블에 게시물 데이터 저장
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: userData.id,
        image_url: publicUrl,
        caption: caption?.trim() || null,
      })
      .select()
      .single();

    if (postError) {
      console.error("Post insert error:", postError);
      // 업로드된 파일 삭제 시도 (실패해도 계속 진행)
      await serviceRoleSupabase.storage.from("posts").remove([fileName]);
      return NextResponse.json(
        { error: "Failed to create post", details: postError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      post: postData,
    });
  } catch (error) {
    console.error("[Post Upload] Post creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
        ...(process.env.NODE_ENV === "development" && errorStack
          ? { stack: errorStack }
          : {}),
      },
      { status: 500 },
    );
  }
}
