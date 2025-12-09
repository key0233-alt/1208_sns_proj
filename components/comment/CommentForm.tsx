/**
 * @file CommentForm.tsx
 * @description 댓글 입력 폼 컴포넌트
 *
 * Instagram 스타일의 댓글 입력 폼입니다.
 * - 댓글 입력 필드 ("댓글 달기...")
 * - Enter 키 또는 "게시" 버튼으로 제출
 * - 제출 중 로딩 상태 표시
 * - 성공 시 입력 필드 초기화
 *
 * @see {@link docs/PRD.md} - 댓글 기능 요구사항 (섹션 7.4)
 */

"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { CommentWithUser } from "@/lib/types";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: (comment: CommentWithUser) => void;
}

const MAX_COMMENT_LENGTH = 1000;

/**
 * CommentForm 컴포넌트
 *
 * @param postId - 게시물 ID (UUID)
 * @param onCommentAdded - 댓글 작성 성공 시 콜백 함수
 */
export default function CommentForm({
  postId,
  onCommentAdded,
}: CommentFormProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 댓글 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("댓글을 입력해주세요.");
      return;
    }

    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      setError(`댓글은 최대 ${MAX_COMMENT_LENGTH}자까지 입력할 수 있습니다.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          content: trimmedContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "댓글 작성에 실패했습니다.";
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      const newComment = data.comment as CommentWithUser;

      // 입력 필드 초기화
      setContent("");
      setError(null);

      // 콜백 호출
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (err) {
      console.error("Comment submit error:", err);
      setError("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }, [content, postId, isSignedIn, router, onCommentAdded]);

  // Enter 키 처리
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isSubmitting && content.trim()) {
          handleSubmit();
        }
      }
    },
    [handleSubmit, isSubmitting, content]
  );

  // 게시 버튼 활성화 여부
  const isSubmitDisabled = !content.trim() || isSubmitting;

  return (
    <div className="border-t border-[#DBDBDB] px-4 py-3">
      {/* 에러 메시지 */}
      {error && (
        <div className="mb-2 text-sm text-red-500">{error}</div>
      )}

      {/* 댓글 입력 폼 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-center gap-2"
      >
        <textarea
          value={content}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= MAX_COMMENT_LENGTH) {
              setContent(value);
              setError(null);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="댓글 달기..."
          rows={1}
          className="flex-1 resize-none border-none outline-none text-sm text-[#262626] placeholder:text-[#8e8e8e] bg-transparent"
          disabled={isSubmitting}
          maxLength={MAX_COMMENT_LENGTH}
        />
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`text-sm font-semibold transition-opacity ${
            isSubmitDisabled
              ? "text-[#8e8e8e] cursor-not-allowed"
              : "text-[#0095f6] hover:opacity-70 cursor-pointer"
          }`}
        >
          {isSubmitting ? "게시 중..." : "게시"}
        </button>
      </form>

      {/* 글자 수 표시 (선택사항) */}
      {content.length > 0 && (
        <div className="mt-1 text-xs text-[#8e8e8e] text-right">
          {content.length} / {MAX_COMMENT_LENGTH}
        </div>
      )}
    </div>
  );
}

