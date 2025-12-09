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

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "@clerk/nextjs";
import {
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import type { PostStatsWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/format-time";
import { truncateText, isTextTruncated } from "@/lib/utils/truncate-text";
import LikeButton from "./LikeButton";

interface PostCardProps {
  post: PostStatsWithUser;
}

/**
 * PostCard 컴포넌트
 *
 * @param post - 게시물 데이터 (PostStatsWithUser 타입)
 */
export default function PostCard({ post }: PostCardProps) {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const captionMaxLength = 100; // 2줄 정도의 길이

  // 캡션 표시 로직
  const shouldTruncateCaption = isTextTruncated(post.caption, captionMaxLength);
  const displayCaption = isCaptionExpanded
    ? post.caption || ""
    : truncateText(post.caption, captionMaxLength);

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
        } else {
          handleLikeChange(optimisticLiked, optimisticCount);
        }
      } catch (error) {
        // 에러 시 롤백
        setIsLiked(false);
        setLikesCount(likesCount);
        console.error("Double tap like error:", error);
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

  // 좋아요 상태 변경 핸들러
  const handleLikeChange = useCallback(
    (liked: boolean, newCount: number) => {
      setIsLiked(liked);
      setLikesCount(newCount);
    },
    []
  );

  return (
    <article className="bg-white border border-[#DBDBDB] rounded-sm mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 */}
          <Link href={`/profile/${post.user_id}`}>
            <UserAvatar
              userId={post.user_clerk_id}
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
        <div className="flex items-center gap-2">
          <time className="text-xs text-[#8e8e8e]">
            {formatRelativeTime(post.created_at)}
          </time>
          {/* ⋯ 메뉴 (추후 구현) */}
          <button
            type="button"
            className="p-1 hover:opacity-50 transition-opacity"
            aria-label="더보기 메뉴"
          >
            <MoreHorizontal className="w-5 h-5 text-[#262626]" />
          </button>
        </div>
      </header>

      {/* 이미지 영역 */}
      <div
        className="relative w-full aspect-square bg-[#FAFAFA] cursor-pointer select-none"
        onDoubleClick={handleImageDoubleTap}
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

        {/* 댓글 미리보기 */}
        {post.comments_count > 0 && (
          <div className="space-y-1">
            {/* "댓글 N개 모두 보기" 링크 */}
            {post.comments_count > (post.comments?.length || 0) && (
              <button
                type="button"
                className="text-sm text-[#8e8e8e] hover:text-[#262626] transition-colors"
                aria-label="댓글 모두 보기"
              >
                댓글 {post.comments_count}개 모두 보기
              </button>
            )}
            {/* 최신 댓글 2개 (역순으로 표시: 오래된 것부터) */}
            {(post.comments || [])
              .slice()
              .reverse()
              .map((comment) => (
                <div key={comment.id} className="text-sm text-[#262626]">
                  <Link
                    href={`/profile/${comment.user_id}`}
                    className="font-semibold hover:opacity-50 transition-opacity mr-2"
                  >
                    {comment.user_name}
                  </Link>
                  <span>{comment.content}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </article>
  );
}
