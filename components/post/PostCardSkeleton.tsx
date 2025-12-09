/**
 * @file PostCardSkeleton.tsx
 * @description 게시물 카드 로딩 UI (Skeleton)
 *
 * PostCard의 로딩 상태를 표시하는 Skeleton 컴포넌트입니다.
 * Shimmer 효과를 포함한 Instagram 스타일의 로딩 UI를 제공합니다.
 *
 * @see {@link components/post/PostCard.tsx} - 실제 PostCard 컴포넌트
 */

/**
 * PostCard Skeleton 컴포넌트
 *
 * 게시물 카드의 로딩 상태를 표시합니다.
 * PostCard와 동일한 레이아웃 구조를 가집니다.
 * Shimmer 효과를 포함한 Instagram 스타일의 로딩 UI를 제공합니다.
 */
export default function PostCardSkeleton() {
  return (
    <div className="bg-white border border-[#DBDBDB] rounded-sm mb-4 overflow-hidden">
      {/* 헤더 Skeleton */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* 프로필 이미지 Skeleton */}
        <div className="w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
        {/* 사용자명 Skeleton */}
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
        {/* 시간 Skeleton */}
        <div className="h-3 w-16 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>

      {/* 이미지 Skeleton */}
      <div className="w-full aspect-square bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>

      {/* 액션 버튼 영역 Skeleton */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 Skeleton */}
          <div className="w-6 h-6 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          {/* 댓글 버튼 Skeleton */}
          <div className="w-6 h-6 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          {/* 공유 버튼 Skeleton */}
          <div className="w-6 h-6 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
        {/* 북마크 버튼 Skeleton */}
        <div className="w-6 h-6 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>

      {/* 컨텐츠 영역 Skeleton */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 Skeleton */}
        <div className="h-4 w-20 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
        {/* 캡션 Skeleton */}
        <div className="space-y-1">
          <div className="h-4 w-full bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          <div className="h-4 w-3/4 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
        {/* 댓글 미리보기 Skeleton */}
        <div className="space-y-1 pt-1">
          <div className="h-3 w-24 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          <div className="h-3 w-full bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          <div className="h-3 w-2/3 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

