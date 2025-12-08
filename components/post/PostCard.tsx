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

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserImage } from "@clerk/nextjs";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import type { PostStatsWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/format-time";
import { truncateText, isTextTruncated } from "@/lib/utils/truncate-text";

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
  const captionMaxLength = 100; // 2줄 정도의 길이

  // 캡션 표시 로직
  const shouldTruncateCaption = isTextTruncated(post.caption, captionMaxLength);
  const displayCaption = isCaptionExpanded
    ? post.caption || ""
    : truncateText(post.caption, captionMaxLength);

  return (
    <article className="bg-white border border-[#DBDBDB] rounded-sm mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 */}
          <Link href={`/profile/${post.user_id}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <UserImage
                userId={post.user_clerk_id}
                className="w-full h-full object-cover"
              />
            </div>
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
      <div className="relative w-full aspect-square bg-[#FAFAFA]">
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          priority={false}
        />
      </div>

      {/* 액션 버튼 영역 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 (UI만, 추후 구현) */}
          <button
            type="button"
            className="hover:opacity-50 transition-opacity"
            aria-label="좋아요"
          >
            <Heart className="w-6 h-6 text-[#262626] stroke-2" />
          </button>
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
        {post.likes_count > 0 && (
          <div className="font-semibold text-[#262626]">
            좋아요 {post.likes_count.toLocaleString()}개
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
            {(post.comments || []).slice().reverse().map((comment) => (
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

