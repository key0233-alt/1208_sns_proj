/**
 * @file PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드를 표시합니다.
 * 헤더, 이미지, 액션 버튼, 좋아요 수, 캡션, 댓글 미리보기를 포함합니다.
 *
 * @see {@link docs/PRD.md} - PostCard 디자인 (섹션 3)
 */

"use client";

import { useState, useRef, useCallback, useEffect, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserAvatar, useUser } from "@clerk/nextjs";
import {
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { extractErrorMessage, getUserFriendlyErrorMessage } from "@/lib/utils/error-handler";
import type { PostStatsWithUser, CommentWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/format-time";
import { truncateText, isTextTruncated } from "@/lib/utils/truncate-text";
import LikeButton from "./LikeButton";
import CommentForm from "@/components/comment/CommentForm";
import CommentList from "@/components/comment/CommentList";
import PostModal from "./PostModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PostCardProps {
  post: PostStatsWithUser;
  allPosts?: PostStatsWithUser[]; // 이전/다음 네비게이션용 (선택사항)
  onDelete?: (postId: string) => void; // 삭제 성공 시 콜백
}

/**
 * PostCard 컴포넌트
 *
 * @param post - 게시물 데이터 (PostStatsWithUser 타입)
 */
function PostCard({ post, allPosts, onDelete }: PostCardProps) {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPostId, setModalPostId] = useState<string>(post.post_id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastTapRef = useRef<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const captionMaxLength = 100; // 2줄 정도의 길이

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
          console.error("Failed to fetch current user ID:", error);
          setCurrentUserId(undefined);
          return;
        }

        setCurrentUserId(data.id);
      } catch (error) {
        console.error("Error fetching current user ID:", error);
        setCurrentUserId(undefined);
      }
    };

    fetchCurrentUserId();
  }, [user, supabase]);

  // 댓글 목록 동기화 (post prop 변경 시)
  useEffect(() => {
    setComments(post.comments || []);
    setCommentsCount(post.comments_count || 0);
  }, [post.comments, post.comments_count]);

  // 캡션 표시 로직 (useMemo로 최적화)
  const shouldTruncateCaption = useMemo(
    () => isTextTruncated(post.caption, captionMaxLength),
    [post.caption, captionMaxLength]
  );
  const displayCaption = useMemo(
    () =>
      isCaptionExpanded
        ? post.caption || ""
        : truncateText(post.caption, captionMaxLength),
    [isCaptionExpanded, post.caption, captionMaxLength]
  );

  // 좋아요 상태 변경 핸들러
  const handleLikeChange = useCallback(
    (liked: boolean, newCount: number) => {
      setIsLiked(liked);
      setLikesCount(newCount);
    },
    []
  );

  // 더블탭 좋아요 처리
  const handleDoubleTap = useCallback(async () => {
    if (!isLiked) {
      // 좋아요 추가
      const optimisticLiked = true;
      const optimisticCount = likesCount + 1;
      setIsLiked(optimisticLiked);
      setLikesCount(optimisticCount);
      setShowDoubleTapHeart(true);
      setTimeout(() => setShowDoubleTapHeart(false), 1000);

      // API 호출
      try {
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: post.post_id }),
        });

        if (!response.ok) {
          // 실패 시 롤백
          setIsLiked(false);
          setLikesCount(likesCount);
          const errorMessage = await extractErrorMessage(response);
          console.error("Double tap like error:", errorMessage);
        } else {
          handleLikeChange(optimisticLiked, optimisticCount);
        }
      } catch (error) {
        // 에러 시 롤백
        setIsLiked(false);
        setLikesCount(likesCount);
        console.error("Double tap like error:", getUserFriendlyErrorMessage(error));
      }
    }
  }, [isLiked, likesCount, post.post_id, handleLikeChange]);

  // 이미지 더블탭 감지
  const handleImageDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleDoubleTap();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [handleDoubleTap]);

  // 댓글 추가 핸들러
  const handleCommentAdded = useCallback(
    (newComment: CommentWithUser) => {
      setComments((prev) => [...prev, newComment]);
      setCommentsCount((prev) => prev + 1);
    },
    []
  );

  // 댓글 삭제 핸들러
  const handleCommentDeleted = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsCount((prev) => Math.max(0, prev - 1));
  }, []);

  // 본인 게시물인지 확인
  const isOwnPost = currentUserId === post.user_id;

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // 게시물 삭제 핸들러
  const handleDelete = useCallback(async () => {
    if (!isOwnPost || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.post_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response);
        alert(errorMessage);
        return;
      }

      // 성공 시 콜백 호출
      if (onDelete) {
        onDelete(post.post_id);
      }

      // 다이얼로그 닫기
      setShowDeleteDialog(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Post delete error:", error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [post.post_id, isOwnPost, isDeleting, onDelete]);

  return (
    <article className="bg-white border border-[#DBDBDB] rounded-sm mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 */}
          <Link href={`/profile/${post.user_id}`}>
            <UserAvatar
              {...({ userId: post.user_clerk_id } as any)}
              size={32}
              className="cursor-pointer"
            />
          </Link>
          {/* 사용자명 */}
          <Link
            href={`/profile/${post.user_id}`}
            className="font-semibold text-[#262626] hover:opacity-50 transition-opacity"
          >
            {post.user_name}
          </Link>
        </div>
        {/* 시간 */}
        <div className="flex items-center gap-2 relative">
          <time className="text-xs text-[#8e8e8e]">
            {formatRelativeTime(post.created_at)}
          </time>
          {/* ⋯ 메뉴 */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsMenuOpen(false);
                }
              }}
              className="p-1 hover:opacity-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#0095f6] focus:ring-offset-2 rounded"
              aria-label="더보기 메뉴"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <MoreHorizontal className="w-5 h-5 text-[#262626]" />
            </button>

            {/* 메뉴 드롭다운 */}
            {isMenuOpen && isOwnPost && (
              <div
                className="absolute right-0 top-full mt-1 bg-white border border-[#DBDBDB] rounded-md shadow-lg z-50 min-w-[160px]"
                role="menu"
                aria-label="게시물 메뉴"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteDialog(true);
                    setIsMenuOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsMenuOpen(false);
                    }
                  }}
                  className="w-full px-4 py-3 text-sm text-red-500 hover:bg-[#FAFAFA] transition-colors flex items-center gap-2 focus:outline-none focus:bg-[#FAFAFA]"
                  role="menuitem"
                  aria-label="게시물 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 이미지 영역 */}
      <div
        className="relative w-full aspect-square bg-[#FAFAFA] cursor-pointer select-none"
        onDoubleClick={handleImageDoubleTap}
        onClick={() => {
          setModalPostId(post.post_id);
          setIsModalOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setModalPostId(post.post_id);
            setIsModalOpen(true);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${post.user_name}님의 게시물 보기`}
      >
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          priority={false}
          draggable={false}
        />
        {/* 더블탭 큰 하트 애니메이션 */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-[doubleTapHeart_1s_ease-out]">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="#ed4956"
                className="drop-shadow-lg"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        )}
        <style jsx>{`
          @keyframes doubleTapHeart {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
            100% {
              opacity: 0;
              transform: scale(1.5);
            }
          }
        `}</style>
      </div>

      {/* 액션 버튼 영역 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 */}
          <LikeButton
            postId={post.post_id}
            initialLiked={isLiked}
            initialLikesCount={likesCount}
            onLikeChange={handleLikeChange}
            onDoubleTap={handleDoubleTap}
          />
          {/* 댓글 버튼 (UI만, 추후 구현) */}
          <button
            type="button"
            className="hover:opacity-50 transition-opacity"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6 text-[#262626] stroke-2" />
          </button>
          {/* 공유 버튼 (UI만, 기능 제외) */}
          <button
            type="button"
            className="hover:opacity-50 transition-opacity"
            aria-label="공유"
          >
            <Send className="w-6 h-6 text-[#262626] stroke-2" />
          </button>
        </div>
        {/* 북마크 버튼 (UI만, 기능 제외) */}
        <button
          type="button"
          className="hover:opacity-50 transition-opacity"
          aria-label="저장"
        >
          <Bookmark className="w-6 h-6 text-[#262626] stroke-2" />
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 pb-4 space-y-2">
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
            <span>{displayCaption}</span>
            {shouldTruncateCaption && !isCaptionExpanded && (
              <button
                type="button"
                onClick={() => setIsCaptionExpanded(true)}
                className="text-[#8e8e8e] hover:text-[#262626] transition-colors ml-1"
              >
                더 보기
              </button>
            )}
          </div>
        )}

        {/* 댓글 목록 */}
        <CommentList
          comments={comments}
          postId={post.post_id}
          mode="preview"
          currentUserId={currentUserId}
          commentsCount={commentsCount}
          onCommentDeleted={handleCommentDeleted}
        />
      </div>

      {/* 댓글 입력 폼 */}
      <CommentForm postId={post.post_id} onCommentAdded={handleCommentAdded} />

      {/* 게시물 상세 모달 */}
      <PostModal
        postId={modalPostId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onPostIdChange={(newPostId) => {
          setModalPostId(newPostId);
        }}
        allPosts={allPosts}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시물 삭제</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#262626]">
              이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm font-semibold text-[#262626] hover:opacity-50 transition-opacity"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-red-500 hover:opacity-70 transition-opacity disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}

// React.memo로 최적화 (props가 변경되지 않으면 리렌더링 방지)
export default memo(PostCard);
