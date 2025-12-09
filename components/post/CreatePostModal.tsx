/**
 * @file CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 작성 모달입니다.
 * - 이미지 업로드 (최대 5MB)
 * - 캡션 입력 (최대 2,200자)
 * - 이미지 미리보기
 *
 * @see {@link docs/PRD.md} - 게시물 작성 요구사항 (섹션 7.2)
 */

"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CAPTION_LENGTH = 2200;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * CreatePostModal 컴포넌트
 *
 * @param open - 모달 열림 상태
 * @param onOpenChange - 모달 상태 변경 핸들러
 */
export default function CreatePostModal({
  open,
  onOpenChange,
}: CreatePostModalProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 파일 타입 검증
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError("지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 가능)");
        return;
      }

      // 파일 크기 검증
      if (file.size > MAX_FILE_SIZE) {
        setError(`파일 크기는 최대 5MB까지 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return;
      }

      setSelectedFile(file);
      setError(null);

      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    []
  );

  // 파일 제거 핸들러
  const handleRemoveFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  // 게시물 업로드 핸들러
  const handleUpload = useCallback(async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!selectedFile) {
      setError("이미지를 선택해주세요.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("image", selectedFile);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      // API 호출
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "게시물 업로드에 실패했습니다.");
      }

      // 성공 시 모달 닫기 및 상태 초기화
      onOpenChange(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 페이지 새로고침하여 새 게시물 표시
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "게시물 업로드에 실패했습니다."
      );
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, caption, isSignedIn, router, previewUrl, onOpenChange]);

  // 모달 닫기 핸들러
  const handleClose = useCallback(() => {
    if (isUploading) return; // 업로드 중에는 닫기 불가

    // 미리보기 URL 정리
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // 상태 초기화
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onOpenChange(false);
  }, [isUploading, previewUrl, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>새 게시물 만들기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 파일 선택 영역 */}
          {!previewUrl ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#DBDBDB] rounded-lg p-12">
              <Upload className="w-12 h-12 text-[#8e8e8e] mb-4" />
              <p className="text-sm text-[#262626] mb-2">
                사진을 여기에 끌어다 놓으세요
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                컴퓨터에서 선택
              </Button>
              <p className="text-xs text-[#8e8e8e] mt-2">
                최대 5MB (JPEG, PNG, WebP, GIF)
              </p>
            </div>
          ) : (
            <div className="relative w-full aspect-square bg-[#FAFAFA] rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="미리보기"
                fill
                className="object-contain"
                sizes="600px"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                aria-label="이미지 제거"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 캡션 입력 영역 */}
          {previewUrl && (
            <div className="space-y-2">
              <Textarea
                placeholder="캡션을 입력하세요..."
                value={caption}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_CAPTION_LENGTH) {
                    setCaption(value);
                    setError(null);
                  }
                }}
                rows={4}
                className="resize-none"
                maxLength={MAX_CAPTION_LENGTH}
              />
              <div className="flex justify-between items-center text-xs text-[#8e8e8e]">
                <span>{caption.length} / {MAX_CAPTION_LENGTH}</span>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* 업로드 버튼 */}
          {previewUrl && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-[#0095f6] hover:bg-[#0095f6]/90 text-white"
              >
                {isUploading ? "업로드 중..." : "공유하기"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

