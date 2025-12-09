/**
 * @file page.tsx
 * @description 검색 페이지
 *
 * Instagram 스타일의 검색 페이지입니다.
 * 현재는 기본 UI만 제공하며, 검색 기능은 향후 구현 예정입니다.
 *
 * @see {@link docs/PRD.md} - 검색 기능 요구사항 (1차 제외)
 */

"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="py-8">
      {/* 검색 입력 */}
      <div className="max-w-[630px] mx-auto px-4">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E8E8E]" />
          <input
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095f6] focus:border-transparent"
            aria-label="검색어 입력"
          />
        </div>

        {/* 검색 결과 영역 */}
        <div className="mt-8">
          {searchQuery ? (
            <div className="text-center py-12">
              <p className="text-[#8E8E8E] text-sm">
                검색 기능은 곧 제공될 예정입니다.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-[#8E8E8E] mx-auto mb-4" />
              <p className="text-[#262626] font-semibold mb-2">검색</p>
              <p className="text-[#8E8E8E] text-sm">
                사용자, 게시물을 검색해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

