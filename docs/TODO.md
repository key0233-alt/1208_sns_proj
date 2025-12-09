- [ ] `.cursor/` 디렉토리
  - [ ] `rules/` 커서룰
  - [ ] `mcp.json` MCP 서버 설정
  - [ ] `dir.md` 프로젝트 디렉토리 구조
- [ ] `.github/` 디렉토리
- [ ] `.husky/` 디렉토리
- [ ] `app/` 디렉토리
  - [ ] `favicon.ico` 파일
  - [ ] `not-found.tsx` 파일
  - [ ] `robots.ts` 파일
  - [ ] `sitemap.ts` 파일
  - [ ] `manifest.ts` 파일
- [ ] `supabase/` 디렉토리
- [ ] `public/` 디렉토리
  - [ ] `icons/` 디렉토리
  - [ ] `logo.png` 파일
  - [ ] `og-image.png` 파일
- [ ] `tsconfig.json` 파일
- [ ] `.cursorignore` 파일
- [ ] `.gitignore` 파일
- [ ] `.prettierignore` 파일
- [ ] `.prettierrc` 파일
- [ ] `tsconfig.json` 파일
- [ ] `eslint.config.mjs` 파일
- [ ] `AGENTS.md` 파일

# 📋 Mini Instagram - 개발 TODO 리스트

## 1. 기본 세팅

### ✅ 완료된 항목

- [x] Tailwind CSS 설정 (인스타 컬러 스키마)
  - [x] `app/globals.css`에 Instagram 컬러 변수 추가
    - `--instagram-blue`: #0095f6
    - `--instagram-background`: #fafafa
    - `--instagram-card`: #ffffff
    - `--instagram-border`: #dbdbdb
    - `--instagram-text-primary`: #262626
    - `--instagram-text-secondary`: #8e8e8e
    - `--instagram-like`: #ed4956
  - [x] 타이포그래피 설정
    - 폰트 패밀리: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    - 텍스트 크기: `--instagram-text-xs` (12px), `--instagram-text-sm` (14px), `--instagram-text-base` (16px), `--instagram-text-xl` (20px)
    - 폰트 굵기: `--instagram-font-normal` (400), `--instagram-font-semibold` (600), `--instagram-font-bold` (700)
- [x] TypeScript 타입 정의
  - [x] `lib/types.ts` 파일 생성 완료
  - [x] User, Post, Like, Comment, Follow 타입 정의 완료
  - [x] PostStats, UserStats 뷰 타입 정의 완료
  - [x] CreatePostInput, CreateCommentInput 입력 타입 정의 완료
  - [x] ApiResponse, PaginationParams, PostListResponse 유틸리티 타입 정의 완료

### ✅ 개발 도구 완료

- [x] 마이그레이션 검증 스크립트 (`scripts/verify-migration.js`)
  - [x] 테이블 존재 여부 확인 (users, posts, likes, comments, follows)
  - [x] 뷰 존재 여부 확인 (post_stats, user_stats)
  - [x] Storage 버킷 확인 (posts)
  - [x] 검증 결과 요약 출력
  - [x] 사용법: `pnpm migration:verify`
- [x] 마이그레이션 SQL 출력 스크립트 (`scripts/show-migration.js`)
  - [x] 마이그레이션 SQL 파일 내용 출력
  - [x] Supabase Dashboard에 복사하기 쉽도록 포맷팅
  - [x] 사용법: `pnpm migration:show schema` 또는 `pnpm migration:show storage`

### 📋 마이그레이션 적용 필요 (Supabase Dashboard에서 실행)

**방법 1: 스크립트 사용 (권장)**

1. 마이그레이션 SQL 확인:

   ```bash
   pnpm migration:show schema    # 데이터베이스 스키마
   pnpm migration:show storage   # Storage 버킷
   ```

2. Supabase Dashboard → SQL Editor에서 출력된 SQL 복사하여 실행

3. 마이그레이션 검증:
   ```bash
   pnpm migration:verify
   ```

**방법 2: 직접 파일 사용**

- [ ] Supabase 데이터베이스 마이그레이션 적용
  - [ ] `supabase/migrations/20251208142214_create_sns_schema.sql` 파일을 Supabase SQL Editor에서 실행
  - [ ] 테이블 생성 확인 (users, posts, likes, comments, follows)
    - Supabase Dashboard → Table Editor에서 확인
    - 또는 `pnpm migration:verify` 실행
  - [ ] Views 및 Triggers 확인
    - `post_stats` 뷰: 게시물별 좋아요 수, 댓글 수 통계
    - `user_stats` 뷰: 사용자별 게시물 수, 팔로워 수, 팔로잉 수 통계
    - `handle_updated_at()` 트리거: posts, comments 테이블의 updated_at 자동 업데이트
- [ ] Supabase Storage 버킷 생성
  - [ ] `supabase/migrations/20251208142252_create_posts_storage_bucket.sql` 파일을 Supabase SQL Editor에서 실행
  - [ ] `posts` 버킷 생성 확인
    - Supabase Dashboard → Storage에서 확인
    - 또는 `pnpm migration:verify` 실행
    - 버킷 설정:
      - 이름: `posts`
      - Public bucket: `true` (공개 읽기)
      - File size limit: `5242880` (5MB)
      - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - [ ] 업로드 정책 설정 (개발 단계에서는 RLS 비활성화로 선택사항)

### 📝 상세 계획

#### 1-1. Tailwind CSS 설정 ✅ 완료

- **파일**: `app/globals.css`
- **상태**: 완료
- **내용**: Instagram 컬러 스키마 및 타이포그래피 변수가 모두 정의되어 있음

#### 1-2. TypeScript 타입 정의 ✅ 완료

- **파일**: `lib/types.ts`
- **상태**: 완료
- **내용**:
  - 데이터베이스 스키마 기반 타입 정의 (User, Post, Like, Comment, Follow)
  - 뷰 타입 정의 (PostStats, UserStats)
  - 입력 타입 정의 (CreatePostInput, CreateCommentInput)
  - 유틸리티 타입 정의 (ApiResponse, PaginationParams, PostListResponse)

#### 1-3. 마이그레이션 도구 개발 ✅ 완료

- **파일**:
  - `scripts/verify-migration.js`: 마이그레이션 검증 스크립트
  - `scripts/show-migration.js`: 마이그레이션 SQL 출력 스크립트
- **상태**: 완료
- **기능**:
  - `pnpm migration:verify`: 데이터베이스 테이블, 뷰, Storage 버킷 검증
  - `pnpm migration:show schema`: 데이터베이스 스키마 SQL 출력
  - `pnpm migration:show storage`: Storage 버킷 SQL 출력

#### 1-4. Supabase 데이터베이스 마이그레이션 적용 필요

- **파일**: `supabase/migrations/20251208142214_create_sns_schema.sql`
- **상태**: 마이그레이션 파일 준비 완료, Supabase에 적용 필요
- **작업 순서**:
  1. 마이그레이션 SQL 확인:
     ```bash
     pnpm migration:show schema
     ```
  2. Supabase Dashboard → SQL Editor 접속
  3. 출력된 SQL을 복사하여 SQL Editor에 붙여넣기 후 실행
  4. 마이그레이션 검증:
     ```bash
     pnpm migration:verify
     ```
  5. 또는 Table Editor에서 다음 테이블 확인:
     - `users`: Clerk 사용자 정보
     - `posts`: 게시물 정보
     - `likes`: 좋아요 정보
     - `comments`: 댓글 정보
     - `follows`: 팔로우 정보
  6. SQL Editor에서 다음 뷰 확인:
     - `post_stats`: 게시물 통계 뷰
     - `user_stats`: 사용자 통계 뷰
  7. 트리거 확인:
     - `set_updated_at` 트리거 (posts, comments 테이블)

#### 1-5. Supabase Storage 버킷 생성 필요

- **파일**: `supabase/migrations/20251208142252_create_posts_storage_bucket.sql`
- **상태**: 마이그레이션 파일 준비 완료, Supabase에 적용 필요
- **작업 순서**:
  1. 마이그레이션 SQL 확인:
     ```bash
     pnpm migration:show storage
     ```
  2. Supabase Dashboard → SQL Editor 접속
  3. 출력된 SQL을 복사하여 SQL Editor에 붙여넣기 후 실행
  4. 마이그레이션 검증:
     ```bash
     pnpm migration:verify
     ```
  5. 또는 Storage 메뉴에서 `posts` 버킷 확인:
     - Public bucket: `true`
     - File size limit: `5242880` (5MB)
     - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  6. (선택사항) 개발 단계에서는 RLS 정책 생략 가능

### 🔍 검증 방법

#### 자동 검증 (권장)

```bash
# 마이그레이션 검증 스크립트 실행
pnpm migration:verify
```

이 스크립트는 다음을 자동으로 확인합니다:

- ✅ 필수 테이블 존재 여부 (users, posts, likes, comments, follows)
- ✅ 필수 뷰 존재 여부 (post_stats, user_stats)
- ✅ Storage 버킷 존재 및 설정 (posts)

#### 수동 검증

**데이터베이스 마이그레이션 검증:**

```sql
-- 테이블 존재 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows');

-- 뷰 존재 확인
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('post_stats', 'user_stats');

-- 트리거 존재 확인
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('posts', 'comments');
```

**Storage 버킷 검증:**

1. Supabase Dashboard → Storage → `posts` 버킷 클릭
2. Settings 탭에서 다음 확인:
   - Name: `posts`
   - Public bucket: `true`
   - File size limit: `5242880`
   - Allowed MIME types: 이미지 파일 타입들

### 📚 참고 문서

- PRD.md: 프로젝트 요구사항 및 디자인 가이드
- `supabase/migrations/db.sql`: 전체 데이터베이스 스키마 (참고용)
- `supabase/migrations/20251208142214_create_sns_schema.sql`: 실제 마이그레이션 파일
- `supabase/migrations/20251208142252_create_posts_storage_bucket.sql`: Storage 버킷 마이그레이션 파일

## 2. 레이아웃 구조

- [x] `app/(main)/layout.tsx` 생성
  - [x] Sidebar 통합
  - [x] 반응형 레이아웃 (Desktop/Tablet/Mobile)
- [x] `components/layout/Sidebar.tsx`
  - [x] Desktop: 244px 너비, 아이콘 + 텍스트
  - [x] Tablet: 72px 너비, 아이콘만
  - [x] Mobile: 숨김
  - [x] 메뉴 항목: 홈, 검색, 만들기, 프로필
  - [x] Hover 효과 및 Active 상태 스타일
- [x] `components/layout/Header.tsx`
  - [x] Mobile 전용 (60px 높이)
  - [x] 로고 + 알림/DM/프로필 아이콘
- [x] `components/layout/BottomNav.tsx`
  - [x] Mobile 전용 (50px 높이)
  - [x] 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필

## 3. 홈 피드 페이지

- [x] `app/(main)/page.tsx` 생성
  - [x] PostFeed 컴포넌트 통합
  - [x] 배경색 #FAFAFA 설정 (layout.tsx에서 설정됨)
- [x] `components/post/PostCard.tsx`
  - [x] 헤더 (프로필 이미지 32px, 사용자명, 시간, ⋯ 메뉴)
  - [x] 이미지 영역 (1:1 정사각형)
  - [x] 액션 버튼 (좋아요, 댓글, 공유, 북마크)
  - [x] 좋아요 수 표시
  - [x] 캡션 (사용자명 Bold + 내용, 2줄 초과 시 "... 더 보기")
  - [x] 댓글 미리보기 (최신 2개)
- [x] `components/post/PostCardSkeleton.tsx`
  - [x] 로딩 UI (Skeleton + Shimmer 효과)
- [x] `components/post/PostFeed.tsx`
  - [x] 게시물 목록 렌더링
  - [x] 무한 스크롤 (Intersection Observer)
  - [x] 페이지네이션 (10개씩)
- [x] `app/api/posts/route.ts`
  - [x] GET: 게시물 목록 조회 (시간 역순 정렬)
  - [x] 페이지네이션 지원 (limit, offset)
  - [x] userId 파라미터 지원 (프로필 페이지용)

## 4. 좋아요 기능

- [x] `app/api/likes/route.ts`
  - [x] POST: 좋아요 추가
  - [x] DELETE: 좋아요 제거
  - [x] 인증 검증 (Clerk)
- [x] `components/post/LikeButton.tsx`
  - [x] 빈 하트 ↔ 빨간 하트 상태 관리
  - [x] 클릭 애니메이션 (scale 1.3 → 1)
  - [x] 더블탭 좋아요 (모바일, 큰 하트 fade in/out)
- [x] PostCard에 LikeButton 통합
  - [x] 좋아요 상태 표시
  - [x] 좋아요 수 실시간 업데이트

## 5. 게시물 작성

- [x] `components/post/CreatePostModal.tsx`
  - [x] Dialog 컴포넌트 사용
  - [x] 이미지 미리보기 UI
  - [x] 텍스트 입력 필드 (최대 2,200자)
  - [x] 파일 선택 버튼
  - [x] 업로드 버튼
- [x] `app/api/posts/route.ts`
  - [x] POST: 게시물 생성
  - [x] 이미지 파일 검증 (최대 5MB)
  - [x] Supabase Storage 업로드
  - [x] posts 테이블에 데이터 저장
  - [x] 인증 검증 (Clerk)
- [x] Sidebar "만들기" 버튼 연결
  - [x] CreatePostModal 열기

## 6. 댓글 기능

- [x] `components/comment/CommentList.tsx`
  - [x] 댓글 목록 렌더링
  - [x] PostCard: 최신 2개만 표시
  - [x] 상세 모달: 전체 댓글 + 스크롤
  - [x] 삭제 버튼 (본인만 표시)
- [x] `components/comment/CommentForm.tsx`
  - [x] 댓글 입력 필드 ("댓글 달기...")
  - [x] Enter 키 또는 "게시" 버튼으로 제출
- [x] `app/api/comments/route.ts`
  - [x] POST: 댓글 작성
  - [x] DELETE: 댓글 삭제 (본인만)
  - [x] 인증 검증 (Clerk)
- [x] PostCard에 댓글 기능 통합
  - [x] CommentList 통합
  - [x] CommentForm 통합

## 7. 게시물 상세 모달

- [x] `components/post/PostModal.tsx`
  - [x] Desktop: 모달 형식 (이미지 50% + 댓글 50%)
  - [x] Mobile: 전체 페이지로 전환
  - [x] 닫기 버튼 (✕)
  - [x] 이전/다음 게시물 네비게이션 (Desktop)
- [x] PostCard 클릭 시 PostModal 열기
  - [x] 게시물 상세 정보 로드
  - [x] 댓글 전체 목록 표시

## 8. 프로필 페이지

- [x] `app/(main)/profile/[userId]/page.tsx`
  - [x] 동적 라우트 생성
  - [x] ProfileHeader 통합
  - [x] PostGrid 통합
- [x] `components/profile/ProfileHeader.tsx`
  - [x] 프로필 이미지 (150px Desktop / 90px Mobile)
  - [x] 사용자명
  - [x] 통계 (게시물 수, 팔로워 수, 팔로잉 수)
  - [x] "팔로우" / "팔로잉" 버튼 (다른 사람 프로필)
  - [x] "프로필 편집" 버튼 (본인 프로필, 1차 제외)
- [x] `components/profile/PostGrid.tsx`
  - [x] 3열 그리드 레이아웃 (반응형)
  - [x] 1:1 정사각형 썸네일
  - [x] Hover 시 좋아요/댓글 수 표시
  - [x] 클릭 시 게시물 상세 모달 열기
- [x] `app/api/users/[userId]/route.ts`
  - [x] GET: 사용자 정보 조회
  - [x] user_stats 뷰 활용
- [x] Sidebar "프로필" 버튼 연결
  - [x] `/profile`로 리다이렉트 (본인 프로필)

## 9. 팔로우 기능

- [x] `app/api/follows/route.ts`
  - [x] POST: 팔로우 추가
  - [x] DELETE: 팔로우 제거
  - [x] 인증 검증 (Clerk)
  - [x] 자기 자신 팔로우 방지
- [x] `components/profile/FollowButton.tsx`
  - [x] "팔로우" 버튼 (파란색, 미팔로우 상태)
  - [x] "팔로잉" 버튼 (회색, 팔로우 중 상태)
  - [x] Hover 시 "언팔로우" (빨간 테두리)
  - [x] 클릭 시 즉시 API 호출 및 UI 업데이트
- [x] ProfileHeader에 FollowButton 통합
  - [x] 팔로우 상태 관리
  - [x] 통계 실시간 업데이트

## 10. 게시물 삭제

- [x] `app/api/posts/[postId]/route.ts`
  - [x] DELETE: 게시물 삭제
  - [x] 본인만 삭제 가능 (인증 검증)
  - [x] Supabase Storage에서 이미지 삭제
- [x] PostCard ⋯ 메뉴
  - [x] 본인 게시물만 삭제 옵션 표시
  - [x] 삭제 확인 다이얼로그
  - [x] 삭제 후 피드에서 제거

## 11. 반응형 및 애니메이션

- [x] 반응형 브레이크포인트 적용
  - [x] Mobile (< 768px): BottomNav, Header 표시
  - [x] Tablet (768px ~ 1023px): Icon-only Sidebar
  - [x] Desktop (1024px+): Full Sidebar
- [x] 좋아요 애니메이션
  - [x] 클릭 시 scale(1.3) → scale(1) (0.15초)
  - [x] 더블탭 시 큰 하트 fade in/out (1초)
- [x] 로딩 상태
  - [x] Skeleton UI (PostCardSkeleton)
  - [x] Shimmer 효과

## 12. 에러 핸들링 및 최적화

- [ ] 에러 핸들링
  - [ ] API 에러 처리
  - [ ] 사용자 친화적 에러 메시지
  - [ ] 네트워크 에러 처리
- [ ] 이미지 최적화
  - [ ] Next.js Image 컴포넌트 사용
  - [ ] Lazy loading
- [ ] 성능 최적화
  - [ ] React.memo 적용 (필요한 컴포넌트)
  - [ ] useMemo, useCallback 활용

## 13. 최종 마무리

- [ ] 모바일/태블릿 반응형 테스트
  - [ ] 다양한 화면 크기에서 테스트
  - [ ] 터치 인터랙션 테스트
- [ ] 접근성 검토
  - [ ] 키보드 네비게이션
  - [ ] ARIA 레이블
- [ ] 코드 정리
  - [ ] 불필요한 주석 제거
  - [ ] 코드 포맷팅
- [ ] 배포 준비
  - [ ] 환경 변수 설정
  - [ ] Vercel 배포 설정
  - [ ] 프로덕션 빌드 테스트
