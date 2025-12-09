/**
 * @file FollowButton.tsx
 * @description 팔로우 버튼 컴포넌트
 *
 * Instagram 스타일의 팔로우/팔로잉 버튼입니다.
 * - 미팔로우: "팔로우" 버튼 (파란색)
 * - 팔로우 중: "팔로잉" 버튼 (회색)
 * - Hover 시 "언팔로우" (빨간 테두리)
 * - 클릭 시 즉시 API 호출 및 UI 업데이트
 *
 * @see {@link docs/PRD.md} - 팔로우 기능 요구사항 (섹션 7.6)
 */

"use client";

import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * FollowButton 컴포넌트
 *
 * @param userId - 팔로우할 사용자 ID
 * @param initialIsFollowing - 초기 팔로우 상태
 * @param onFollowChange - 팔로우 상태 변경 콜백 (팔로워 수 업데이트용)
 */
export default function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // 팔로우 버튼 클릭 핸들러
  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const wasFollowing = isFollowing;

    // 낙관적 업데이트
    setIsFollowing(!wasFollowing);

    try {
      const method = wasFollowing ? "DELETE" : "POST";
      const response = await fetch("/api/follows", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followingId: userId,
        }),
      });

      if (!response.ok) {
        // 실패 시 롤백
        setIsFollowing(wasFollowing);
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "팔로우 처리에 실패했습니다.");
        return;
      }

      // 성공 시 콜백 호출 (팔로워 수 업데이트)
      if (onFollowChange) {
        // 팔로워 수는 ProfileHeader에서 낙관적 업데이트로 처리
        onFollowChange(!wasFollowing);
      }
    } catch (error) {
      // 에러 시 롤백
      setIsFollowing(wasFollowing);
      console.error("Follow error:", error);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (isLoading) return "처리 중...";
    if (isFollowing && isHovering) return "언팔로우";
    if (isFollowing) return "팔로잉";
    return "팔로우";
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 ${
        isFollowing
          ? `bg-white border ${
              isHovering
                ? "border-red-500 text-red-500"
                : "border-[#DBDBDB] text-[#262626]"
            }`
          : "bg-[#0095f6] text-white hover:bg-[#0095f6]/90"
      }`}
      aria-label={isFollowing ? "언팔로우" : "팔로우"}
    >
      {getButtonText()}
    </button>
  );
}

