/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * Instagram 스타일의 홈 피드를 표시합니다.
 * PostFeed 컴포넌트를 사용하여 게시물 목록과 무한 스크롤을 제공합니다.
 *
 * @see {@link docs/PRD.md} - 홈 피드 요구사항 (섹션 7.2)
 */

import PostFeed from "@/components/post/PostFeed";

export default function Home() {
  return (
    <div className="py-4">
      <PostFeed />
    </div>
  );
}
