/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트 (무한 스크롤)
 *
 * 게시물 목록을 표시하고 무한 스크롤을 구현합니다.
 * Intersection Observer를 사용하여 하단 도달 시 자동으로 다음 페이지를 로드합니다.
 *
 * @see {@link docs/PRD.md} - 무한 스크롤 요구사항 (섹션 8)
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import type { PostStatsWithUser, PostListResponse } from "@/lib/types";

interface PostFeedProps {
  userId?: string; // 프로필 페이지용 필터링 (선택사항)
}

/**
 * PostFeed 컴포넌트
 *
 * @param userId - 특정 사용자의 게시물만 표시 (프로필 페이지용)
 */
export default function PostFeed({ userId }: PostFeedProps = {}) {
  const [posts, setPosts] = useState<PostStatsWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const observerTarget = useRef<HTMLDivElement>(null);

  // 게시물 로드 함수
  const loadPosts = useCallback(
    async (currentOffset: number, reset = false) => {
      try {
        setError(null);
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: currentOffset.toString(),
        });

        if (userId) {
          params.append("userId", userId);
        }

        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          throw new Error("게시물을 불러오는데 실패했습니다.");
        }

        const data: PostListResponse = await response.json();

        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }

        setHasMore(data.hasMore);
        setOffset(currentOffset + limit);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [userId, limit]
  );

  // 초기 로드
  useEffect(() => {
    setLoading(true);
    setOffset(0);
    setHasMore(true);
    setPosts([]);
    loadPosts(0, true);
  }, [userId, loadPosts]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPosts(offset, false);
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, offset, loadPosts]);

  // 에러 상태
  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-[#8e8e8e] mb-4">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            setOffset(0);
            setHasMore(true);
            setPosts([]);
            loadPosts(0, true);
          }}
          className="px-4 py-2 bg-[#0095f6] text-white rounded-md hover:bg-[#0095f6]/90 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 빈 상태
  if (!loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-[#8e8e8e]">게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 게시물 목록 */}
      {posts.map((post) => (
        <PostCard key={post.post_id} post={post} allPosts={posts} />
      ))}

      {/* 로딩 상태 */}
      {loading && (
        <div>
          {posts.length === 0 ? (
            // 초기 로딩: 3개 Skeleton
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : (
            // 추가 로딩: 1개 Skeleton
            <PostCardSkeleton />
          )}
        </div>
      )}

      {/* Intersection Observer 타겟 */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-4" aria-hidden="true" />
      )}

      {/* 더 이상 게시물이 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-[#8e8e8e]">모든 게시물을 불러왔습니다.</p>
        </div>
      )}
    </div>
  );
}



