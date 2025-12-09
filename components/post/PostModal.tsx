/**
 * @file PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 상세 모달입니다.
 * - Desktop: 모달 형식 (이미지 50% + 댓글 50%)
 * - Mobile: 전체 페이지로 전환
 * - 댓글 전체 목록 표시
 * - 이전/다음 게시물 네비게이션 (Desktop)
 *
 * @see {@link docs/PRD.md} - 게시물 상세 모달 요구사항 (섹션 5)
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserAvatar, useUser } from "@clerk/nextjs";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PostStatsWithUser, CommentWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/format-time";
import LikeButton from "./LikeButton";
import CommentList from "@/components/comment/CommentList";
import CommentForm from "@/components/comment/CommentForm";

interface PostModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostIdChange?: (newPostId: string) => void; // 이전/다음 게시물로 이동 시 호출
  allPosts?: PostStatsWithUser[]; // 이전/다음 네비게이션용 (선택사항)
}

/**
 * PostModal 컴포넌트
 *
 * @param postId - 게시물 ID (UUID)
 * @param open - 모달 열림 상태
 * @param onOpenChange - 모달 상태 변경 핸들러
 * @param allPosts - 전체 게시물 목록 (이전/다음 네비게이션용)
 */
export default function PostModal({
  postId,
  open,
  onOpenChange,
  onPostIdChange,
  allPosts,
}: PostModalProps) {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [post, setPost] = useState<PostStatsWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // 현재 사용자 ID 조회 (본인 댓글 확인용)
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      if (!user?.id) {
        setCurrentUserId(undefined);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (error || !data) {
          setCurrentUserId(undefined);
          return;
        }

        setCurrentUserId(data.id);
      } catch (error) {
        console.error("Error fetching current user ID:", error);
        setCurrentUserId(undefined);
      }
    };

    if (open) {
      fetchCurrentUserId();
    }
  }, [user, supabase, open]);

  // 게시물 데이터 로드
  const loadPost = useCallback(async () => {
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "게시물을 불러올 수 없습니다.";
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      const postData = data.post as PostStatsWithUser;

      setPost(postData);
      setLikesCount(postData.likes_count || 0);
      setIsLiked(postData.is_liked || false);
      setComments(postData.comments || []);
      setCommentsCount(postData.comments_count || 0);
    } catch (err) {
      console.error("Post load error:", err);
      setError("게시물을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // 모달이 열릴 때 게시물 로드
  useEffect(() => {
    if (open && postId) {
      loadPost();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setPost(null);
      setError(null);
      setComments([]);
      setCommentsCount(0);
    }
  }, [open, postId, loadPost]);

  // 좋아요 상태 변경 핸들러
  const handleLikeChange = useCallback(
    (liked: boolean, newCount: number) => {
      setIsLiked(liked);
      setLikesCount(newCount);
    },
    []
  );

  // 댓글 추가 핸들러
  const handleCommentAdded = useCallback((newComment: CommentWithUser) => {
    setComments((prev) => [...prev, newComment]);
    setCommentsCount((prev) => prev + 1);
  }, []);

  // 댓글 삭제 핸들러
  const handleCommentDeleted = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsCount((prev) => Math.max(0, prev - 1));
  }, []);

  // 이전/다음 게시물 찾기
  const findAdjacentPosts = useCallback(() => {
    if (!allPosts || !post) return { prev: null, next: null };

    const currentIndex = allPosts.findIndex((p) => p.post_id === post.post_id);
    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
      next: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
    };
  }, [allPosts, post]);

  const { prev: prevPost, next: nextPost } = findAdjacentPosts();

  // 이전/다음 게시물로 이동
  const handleNavigate = useCallback(
    (targetPostId: string) => {
      if (onPostIdChange) {
        onPostIdChange(targetPostId);
      }
    },
    [onPostIdChange]
  );

  // 모달 닫기 핸들러
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [open, handleClose]);

  // 모바일 여부 확인
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 모바일인 경우 전체 페이지로 렌더링
  if (isMobile && open) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-[#DBDBDB]">
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:opacity-50 transition-opacity"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-[#262626]" />
          </button>
          <h2 className="font-semibold text-[#262626]">게시물</h2>
          <div className="w-10" /> {/* 공간 맞춤 */}
        </header>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-[#8e8e8e]">로딩 중...</div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {/* 게시물 내용 */}
        {post && !isLoading && (
          <>
            {/* 이미지 */}
            <div className="relative w-full aspect-square bg-[#FAFAFA]">
              <Image
                src={post.image_url}
                alt={post.caption || "게시물 이미지"}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* 컨텐츠 영역 */}
            <div className="px-4 py-3 space-y-3">
              {/* 액션 버튼 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <LikeButton
                    postId={post.post_id}
                    initialLiked={isLiked}
                    initialLikesCount={likesCount}
                    onLikeChange={handleLikeChange}
                  />
                  <button
                    type="button"
                    className="hover:opacity-50 transition-opacity"
                    aria-label="댓글"
                  >
                    <MessageCircle className="w-6 h-6 text-[#262626] stroke-2" />
                  </button>
                  <button
                    type="button"
                    className="hover:opacity-50 transition-opacity"
                    aria-label="공유"
                  >
                    <Send className="w-6 h-6 text-[#262626] stroke-2" />
                  </button>
                </div>
                <button
                  type="button"
                  className="hover:opacity-50 transition-opacity"
                  aria-label="저장"
                >
                  <Bookmark className="w-6 h-6 text-[#262626] stroke-2" />
                </button>
              </div>

              {/* 좋아요 수 */}
              {likesCount > 0 && (
                <div className="font-semibold text-[#262626]">
                  좋아요 {likesCount.toLocaleString()}개
                </div>
              )}

              {/* 캡션 */}
              {post.caption && (
                <div className="text-sm text-[#262626]">
                  <Link
                    href={`/profile/${post.user_id}`}
                    className="font-semibold hover:opacity-50 transition-opacity mr-2"
                  >
                    {post.user_name}
                  </Link>
                  <span>{post.caption}</span>
                </div>
              )}

              {/* 댓글 목록 */}
              <CommentList
                comments={comments}
                postId={post.post_id}
                mode="full"
                currentUserId={currentUserId}
                commentsCount={commentsCount}
                onCommentDeleted={handleCommentDeleted}
              />
            </div>

            {/* 댓글 입력 폼 */}
            <div className="sticky bottom-0 bg-white border-t border-[#DBDBDB]">
              <CommentForm postId={post.post_id} onCommentAdded={handleCommentAdded} />
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop 모달
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[600px] p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">게시물 상세</DialogTitle>
        {/* 닫기 버튼 및 네비게이션 */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {/* 이전 게시물 버튼 */}
            {prevPost && (
              <button
                type="button"
                onClick={() => handleNavigate(prevPost.post_id)}
                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                aria-label="이전 게시물"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={handleClose}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 다음 게시물 버튼 */}
          <div className="flex items-center gap-2">
            {nextPost && (
              <button
                type="button"
                onClick={() => handleNavigate(nextPost.post_id)}
                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                aria-label="다음 게시물"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-[#8e8e8e]">로딩 중...</div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {/* 게시물 내용 */}
        {post && !isLoading && (
          <div className="flex h-[600px]">
            {/* 좌측: 이미지 영역 (50%) */}
            <div className="relative w-1/2 bg-[#FAFAFA] flex items-center justify-center">
              <Image
                src={post.image_url}
                alt={post.caption || "게시물 이미지"}
                fill
                className="object-contain"
                sizes="450px"
                priority
              />
            </div>

            {/* 우측: 댓글 영역 (50%) */}
            <div className="w-1/2 flex flex-col border-l border-[#DBDBDB]">
              {/* 헤더 */}
              <header className="flex items-center justify-between px-4 py-3 border-b border-[#DBDBDB]">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${post.user_id}`}>
                    <UserAvatar
                      {...({ userId: post.user_clerk_id } as any)}
                      size={32}
                      className="cursor-pointer"
                    />
                  </Link>
                  <Link
                    href={`/profile/${post.user_id}`}
                    className="font-semibold text-[#262626] hover:opacity-50 transition-opacity"
                  >
                    {post.user_name}
                  </Link>
                </div>
                <button
                  type="button"
                  className="p-1 hover:opacity-50 transition-opacity"
                  aria-label="더보기 메뉴"
                >
                  <MoreHorizontal className="w-5 h-5 text-[#262626]" />
                </button>
              </header>

              {/* 댓글 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {/* 캡션 */}
                {post.caption && (
                  <div className="text-sm text-[#262626] pb-3 border-b border-[#DBDBDB]">
                    <Link
                      href={`/profile/${post.user_id}`}
                      className="font-semibold hover:opacity-50 transition-opacity mr-2"
                    >
                      {post.user_name}
                    </Link>
                    <span>{post.caption}</span>
                  </div>
                )}

                {/* 댓글 목록 */}
                <CommentList
                  comments={comments}
                  postId={post.post_id}
                  mode="full"
                  currentUserId={currentUserId}
                  commentsCount={commentsCount}
                  onCommentDeleted={handleCommentDeleted}
                />
              </div>

              {/* 하단 고정 영역 */}
              <div className="border-t border-[#DBDBDB]">
                {/* 액션 버튼 */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-4">
                    <LikeButton
                      postId={post.post_id}
                      initialLiked={isLiked}
                      initialLikesCount={likesCount}
                      onLikeChange={handleLikeChange}
                    />
                    <button
                      type="button"
                      className="hover:opacity-50 transition-opacity"
                      aria-label="댓글"
                    >
                      <MessageCircle className="w-6 h-6 text-[#262626] stroke-2" />
                    </button>
                    <button
                      type="button"
                      className="hover:opacity-50 transition-opacity"
                      aria-label="공유"
                    >
                      <Send className="w-6 h-6 text-[#262626] stroke-2" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="hover:opacity-50 transition-opacity"
                    aria-label="저장"
                  >
                    <Bookmark className="w-6 h-6 text-[#262626] stroke-2" />
                  </button>
                </div>

                {/* 좋아요 수 */}
                {likesCount > 0 && (
                  <div className="px-4 pb-2 font-semibold text-[#262626]">
                    좋아요 {likesCount.toLocaleString()}개
                  </div>
                )}

                {/* 댓글 입력 폼 */}
                <CommentForm postId={post.post_id} onCommentAdded={handleCommentAdded} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

