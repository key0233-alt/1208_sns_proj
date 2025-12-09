/**
 * @file LikeButton.tsx
 * @description 좋아요 버튼 컴포넌트
 *
 * Instagram 스타일의 좋아요 버튼입니다.
 * - 빈 하트 ↔ 빨간 하트 상태 관리
 * - 클릭 애니메이션 (scale 1.3 → 1)
 * - 더블탭 좋아요 (모바일, 큰 하트 fade in/out)
 *
 * @see {@link docs/PRD.md} - 좋아요 기능 요구사항 (섹션 7.3)
 */

"use client";

import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  onDoubleTap?: () => void;
}

/**
 * LikeButton 컴포넌트
 *
 * @param postId - 게시물 ID
 * @param initialLiked - 초기 좋아요 상태
 * @param initialLikesCount - 초기 좋아요 수
 * @param onLikeChange - 좋아요 상태 변경 콜백
 * @param onDoubleTap - 더블탭 콜백
 */
export default function LikeButton({
  postId,
  initialLiked,
  initialLikesCount,
  onLikeChange,
  onDoubleTap,
}: LikeButtonProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = useCallback(async () => {
    if (!isSignedIn) {
      // 로그인 페이지로 리다이렉트
      router.push("/sign-in");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const newLiked = !liked;
    const optimisticCount = newLiked ? likesCount + 1 : likesCount - 1;

    // 낙관적 업데이트
    setLiked(newLiked);
    setLikesCount(optimisticCount);
    setIsAnimating(true);

    try {
      if (newLiked) {
        // 좋아요 추가
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId }),
        });

        if (!response.ok) {
          // 실패 시 롤백
          setLiked(!newLiked);
          setLikesCount(likesCount);
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.message || "좋아요 처리에 실패했습니다.";
          console.error("Failed to like:", errorMessage);
          alert(errorMessage);
        } else {
          // 성공 시 콜백 호출
          onLikeChange?.(newLiked, optimisticCount);
        }
      } else {
        // 좋아요 제거
        const response = await fetch(`/api/likes?postId=${postId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          // 실패 시 롤백
          setLiked(!newLiked);
          setLikesCount(likesCount);
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.message || "좋아요 취소에 실패했습니다.";
          console.error("Failed to unlike:", errorMessage);
          alert(errorMessage);
        } else {
          // 성공 시 콜백 호출
          onLikeChange?.(newLiked, optimisticCount);
        }
      }
    } catch (error) {
      // 에러 시 롤백
      setLiked(!newLiked);
      setLikesCount(likesCount);
      console.error("Like error:", error);
      
      // 네트워크 에러 확인
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert("네트워크 연결을 확인해주세요.");
      } else {
        alert("좋아요 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 150);
    }
  }, [liked, likesCount, postId, isSignedIn, router, isLoading, onLikeChange]);

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isLoading}
      className="hover:opacity-50 transition-opacity"
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      style={{
        transform: isAnimating ? "scale(1.3)" : "scale(1)",
        transition: "transform 0.15s ease-out",
      }}
    >
      <Heart
        className={`w-6 h-6 stroke-2 transition-all duration-150 ${
          liked
            ? "fill-[#ed4956] text-[#ed4956]"
            : "text-[#262626] fill-none"
        }`}
      />
    </button>
  );
}

