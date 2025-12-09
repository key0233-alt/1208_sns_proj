/**
 * @file PostGrid.tsx
 * @description 게시물 그리드 컴포넌트
 *
 * Instagram 스타일의 3열 그리드 레이아웃입니다.
 * - 3열 그리드 (반응형: Mobile 2열, Tablet 3열, Desktop 3열)
 * - 1:1 정사각형 썸네일
 * - Hover 시 좋아요/댓글 수 표시
 * - 클릭 시 게시물 상세 모달 열기
 *
 * @see {@link docs/PRD.md} - 프로필 페이지 요구사항 (섹션 7.5)
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import type { PostStatsWithUser, PostListResponse } from "@/lib/types";
import PostModal from "@/components/post/PostModal";

interface PostGridProps {
  userId: string;
}

/**
 * PostGrid 컴포넌트
 *
 * @param userId - 사용자 ID (게시물 필터링 및 모달에서 allPosts 전달용)
 */
export default function PostGrid({ userId }: PostGridProps) {
  const [posts, setPosts] = useState<PostStatsWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 게시물 로드
  const loadPosts = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        limit: "100", // 프로필에서는 모든 게시물 로드
        offset: "0",
        userId: userId,
      });

      const response = await fetch(`/api/posts?${params.toString()}`);

      if (!response.ok) {
        throw new Error("게시물을 불러오는데 실패했습니다.");
      }

      const data: PostListResponse = await response.json();
      setPosts(data.posts);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 초기 로드
  useEffect(() => {
    setLoading(true);
    loadPosts();
  }, [loadPosts]);

  // 게시물 클릭 핸들러
  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 md:gap-1">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-[#FAFAFA] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          type="button"
          onClick={loadPosts}
          className="px-4 py-2 bg-[#0095f6] text-white rounded-md hover:bg-[#0095f6]/90 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 빈 상태
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-[#8e8e8e]">게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 md:gap-1">
        {posts.map((post) => (
          <div
            key={post.post_id}
            className="relative aspect-square bg-[#FAFAFA] cursor-pointer group"
            onClick={() => handlePostClick(post.post_id)}
          >
            {/* 썸네일 이미지 */}
            <Image
              src={post.image_url}
              alt={post.caption || "게시물 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority={false}
            />

            {/* Hover 오버레이 (좋아요/댓글 수) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-6 h-6 fill-white" />
                <span className="font-semibold">
                  {post.likes_count.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="font-semibold">
                  {post.comments_count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 게시물 상세 모달 */}
      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onPostIdChange={(newPostId) => {
            setSelectedPostId(newPostId);
          }}
          allPosts={posts}
        />
      )}
    </>
  );
}

