/**
 * @file CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * Instagram 스타일의 댓글 목록을 표시합니다.
 * - preview 모드: 최신 2개만 표시 (PostCard용)
 * - full 모드: 전체 댓글 표시 (상세 모달용, 스크롤 가능)
 * - 삭제 버튼 (본인 댓글만 표시)
 *
 * @see {@link docs/PRD.md} - 댓글 기능 요구사항 (섹션 7.4)
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CommentWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/format-time";

interface CommentListProps {
  comments: CommentWithUser[];
  postId: string;
  mode?: "preview" | "full";
  currentUserId?: string; // 본인 댓글 확인용 (user_id)
  commentsCount?: number; // 전체 댓글 수 (preview 모드에서 "댓글 N개 모두 보기" 표시용)
  onCommentDeleted?: (commentId: string) => void;
}

/**
 * CommentList 컴포넌트
 *
 * @param comments - 댓글 목록
 * @param postId - 게시물 ID
 * @param mode - 표시 모드 ('preview' | 'full')
 * @param currentUserId - 현재 사용자 ID (본인 댓글 확인용)
 * @param commentsCount - 전체 댓글 수
 * @param onCommentDeleted - 댓글 삭제 성공 시 콜백 함수
 */
export default function CommentList({
  comments,
  postId,
  mode = "preview",
  currentUserId,
  commentsCount,
  onCommentDeleted,
}: CommentListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // 표시할 댓글 목록 (preview 모드일 경우 최신 2개만)
  const displayComments =
    mode === "preview" ? comments.slice(-2) : comments;

  // 댓글 삭제 핸들러
  const handleDelete = useCallback(
    async (commentId: string) => {
      setIsDeleting(commentId);

      try {
        const response = await fetch(`/api/comments?commentId=${commentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || "댓글 삭제에 실패했습니다.";
          alert(errorMessage);
          return;
        }

        // 성공 시 콜백 호출
        if (onCommentDeleted) {
          onCommentDeleted(commentId);
        }
      } catch (err) {
        console.error("Comment delete error:", err);
        alert("댓글 삭제 중 오류가 발생했습니다.");
      } finally {
        setIsDeleting(null);
        setShowDeleteDialog(false);
        setCommentToDelete(null);
      }
    },
    [onCommentDeleted]
  );

  // 삭제 확인 다이얼로그 열기
  const handleDeleteClick = useCallback((commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  }, []);

  // 본인 댓글인지 확인
  const isOwnComment = useCallback(
    (comment: CommentWithUser) => {
      return currentUserId && comment.user_id === currentUserId;
    },
    [currentUserId]
  );

  if (comments.length === 0 && mode === "preview") {
    return null;
  }

  return (
    <>
      <div className="space-y-1">
        {/* "댓글 N개 모두 보기" 링크 (preview 모드에서만) */}
        {mode === "preview" &&
          commentsCount !== undefined &&
          commentsCount > displayComments.length && (
            <button
              type="button"
              className="text-sm text-[#8e8e8e] hover:text-[#262626] transition-colors"
              aria-label="댓글 모두 보기"
            >
              댓글 {commentsCount}개 모두 보기
            </button>
          )}

        {/* 댓글 목록 */}
        {displayComments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start justify-between gap-2 group"
          >
            <div className="flex-1 text-sm text-[#262626]">
              <Link
                href={`/profile/${comment.user_id}`}
                className="font-semibold hover:opacity-50 transition-opacity mr-2"
              >
                {comment.user_name}
              </Link>
              <span>{comment.content}</span>
              {mode === "full" && (
                <span className="ml-2 text-xs text-[#8e8e8e]">
                  {formatRelativeTime(comment.created_at)}
                </span>
              )}
            </div>

            {/* 삭제 버튼 (본인 댓글만 표시) */}
            {isOwnComment(comment) && (
              <button
                type="button"
                onClick={() => handleDeleteClick(comment.id)}
                disabled={isDeleting === comment.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:opacity-50"
                aria-label="댓글 삭제"
              >
                <MoreHorizontal className="w-4 h-4 text-[#8e8e8e]" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#262626]">
              이 댓글을 삭제하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-[#262626] hover:opacity-50 transition-opacity"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (commentToDelete) {
                    handleDelete(commentToDelete);
                  }
                }}
                disabled={isDeleting !== null}
                className="px-4 py-2 text-sm font-semibold text-red-500 hover:opacity-70 transition-opacity disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

