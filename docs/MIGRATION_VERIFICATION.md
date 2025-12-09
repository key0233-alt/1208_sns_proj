# 마이그레이션 검증 가이드

이 문서는 Supabase 데이터베이스 마이그레이션과 Storage 버킷이 올바르게 적용되었는지 확인하는 방법을 설명합니다.

## 1. 데이터베이스 마이그레이션 검증

### 1.1 마이그레이션 파일 적용

**방법 1: Supabase Dashboard SQL Editor 사용 (권장)**

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **"SQL Editor"** 클릭
4. **"New query"** 클릭
5. `supabase/migrations/20251208142214_create_sns_schema.sql` 파일 내용을 복사하여 붙여넣기
6. **"Run"** 버튼 클릭 (또는 `Ctrl+Enter` / `Cmd+Enter`)
7. 성공 메시지 확인: `Success. No rows returned`

**방법 2: Supabase CLI 사용 (선택사항)**

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 적용
supabase db push
```

### 1.2 테이블 생성 확인

1. Supabase Dashboard → **"Table Editor"** 메뉴
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ `users` - Clerk 사용자 정보
   - ✅ `posts` - 게시물
   - ✅ `likes` - 좋아요
   - ✅ `comments` - 댓글
   - ✅ `follows` - 팔로우

**각 테이블의 컬럼 확인:**

**users 테이블:**
- `id` (UUID, Primary Key)
- `clerk_id` (TEXT, Unique, NOT NULL)
- `name` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

**posts 테이블:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `image_url` (TEXT, NOT NULL)
- `caption` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

**likes 테이블:**
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key → posts.id)
- `user_id` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- UNIQUE 제약: `(post_id, user_id)`

**comments 테이블:**
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key → posts.id)
- `user_id` (UUID, Foreign Key → users.id)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

**follows 테이블:**
- `id` (UUID, Primary Key)
- `follower_id` (UUID, Foreign Key → users.id)
- `following_id` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- UNIQUE 제약: `(follower_id, following_id)`
- CHECK 제약: `follower_id != following_id`

### 1.3 인덱스 생성 확인

1. Supabase Dashboard → **"Database"** → **"Indexes"** 메뉴
2. 다음 인덱스들이 생성되었는지 확인:

**posts 테이블 인덱스:**
- ✅ `idx_posts_user_id` (user_id)
- ✅ `idx_posts_created_at` (created_at DESC)

**likes 테이블 인덱스:**
- ✅ `idx_likes_post_id` (post_id)
- ✅ `idx_likes_user_id` (user_id)

**comments 테이블 인덱스:**
- ✅ `idx_comments_post_id` (post_id)
- ✅ `idx_comments_user_id` (user_id)
- ✅ `idx_comments_created_at` (created_at DESC)

**follows 테이블 인덱스:**
- ✅ `idx_follows_follower_id` (follower_id)
- ✅ `idx_follows_following_id` (following_id)

### 1.4 Views 생성 확인

1. Supabase Dashboard → **"Database"** → **"Views"** 메뉴
2. 다음 뷰들이 생성되었는지 확인:
   - ✅ `post_stats` - 게시물 통계 (좋아요 수, 댓글 수)
   - ✅ `user_stats` - 사용자 통계 (게시물 수, 팔로워 수, 팔로잉 수)

**뷰 구조 확인:**

**post_stats 뷰:**
```sql
SELECT
  post_id,
  user_id,
  image_url,
  caption,
  created_at,
  likes_count,
  comments_count
FROM post_stats;
```

**user_stats 뷰:**
```sql
SELECT
  user_id,
  clerk_id,
  name,
  posts_count,
  followers_count,
  following_count
FROM user_stats;
```

### 1.5 Triggers 생성 확인

1. Supabase Dashboard → **"Database"** → **"Triggers"** 메뉴
2. 다음 트리거들이 생성되었는지 확인:
   - ✅ `set_updated_at` on `posts` 테이블
   - ✅ `set_updated_at` on `comments` 테이블

**트리거 함수 확인:**

1. Supabase Dashboard → **"Database"** → **"Functions"** 메뉴
2. 다음 함수가 생성되었는지 확인:
   - ✅ `handle_updated_at()` - updated_at 자동 업데이트 함수

**트리거 동작 테스트:**

```sql
-- posts 테이블 트리거 테스트
UPDATE posts SET caption = 'Updated caption' WHERE id = 'some-uuid';
-- updated_at이 자동으로 업데이트되는지 확인

-- comments 테이블 트리거 테스트
UPDATE comments SET content = 'Updated content' WHERE id = 'some-uuid';
-- updated_at이 자동으로 업데이트되는지 확인
```

### 1.6 RLS 상태 확인

1. Supabase Dashboard → **"Table Editor"** 메뉴
2. 각 테이블을 선택하고 **"Settings"** 탭 확인
3. **"Row Level Security"** 상태 확인:
   - 개발 단계: RLS가 **비활성화**되어 있어야 함
   - 프로덕션: RLS가 **활성화**되어 있어야 함

**확인할 테이블:**
- `users` - RLS 비활성화 (개발)
- `posts` - RLS 비활성화 (개발)
- `likes` - RLS 비활성화 (개발)
- `comments` - RLS 비활성화 (개발)
- `follows` - RLS 비활성화 (개발)

## 2. Storage 버킷 검증

### 2.1 버킷 생성 확인

**방법 1: Supabase Dashboard 사용 (권장)**

1. Supabase Dashboard → **"Storage"** 메뉴
2. 다음 버킷이 생성되었는지 확인:
   - ✅ `posts` - 게시물 이미지 저장소

**방법 2: 마이그레이션 파일 사용**

1. Supabase Dashboard → **"SQL Editor"** 메뉴
2. **"New query"** 클릭
3. `supabase/migrations/20251208142252_create_posts_storage_bucket.sql` 파일 내용을 복사하여 붙여넣기
4. **"Run"** 버튼 클릭
5. 성공 메시지 확인

### 2.2 버킷 설정 확인

1. Supabase Dashboard → **"Storage"** → **"posts"** 버킷 클릭
2. **"Settings"** 탭에서 다음 설정 확인:

**버킷 설정:**
- ✅ **Name**: `posts`
- ✅ **Public bucket**: `true` (공개 읽기)
- ✅ **File size limit**: `5242880` (5MB)
- ✅ **Allowed MIME types**: 
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

### 2.3 버킷 권한 확인

1. Supabase Dashboard → **"Storage"** → **"posts"** 버킷 → **"Policies"** 탭
2. 개발 단계에서는 RLS가 비활성화되어 있어야 함
3. 프로덕션에서는 적절한 RLS 정책이 설정되어 있어야 함

## 3. 통합 테스트

### 3.1 데이터베이스 연결 테스트

프로젝트에서 다음 명령어로 테스트:

```bash
pnpm dev
```

브라우저에서 다음 페이지들을 확인:
- `/instruments` - Supabase 연결 테스트
- `/auth-test` - Clerk + Supabase 인증 테스트

### 3.2 Storage 업로드 테스트 (선택사항)

1. `/storage-test` 페이지에서 이미지 업로드 테스트
2. 업로드된 파일이 `posts` 버킷에 저장되는지 확인
3. 업로드된 파일의 공개 URL이 정상적으로 작동하는지 확인

## 4. 문제 해결

### 마이그레이션 적용 실패

**에러: "relation already exists"**
- 테이블이 이미 존재하는 경우
- 해결: `CREATE TABLE IF NOT EXISTS` 구문이 포함되어 있으므로 안전하게 재실행 가능

**에러: "permission denied"**
- 권한 문제
- 해결: Supabase Dashboard에서 올바른 프로젝트를 선택했는지 확인

### Storage 버킷 생성 실패

**에러: "bucket already exists"**
- 버킷이 이미 존재하는 경우
- 해결: `ON CONFLICT` 구문이 포함되어 있으므로 안전하게 재실행 가능

**에러: "invalid MIME type"**
- MIME 타입 형식 오류
- 해결: 마이그레이션 파일의 MIME 타입 배열 형식 확인

## 5. 체크리스트

마이그레이션 검증을 위한 체크리스트:

### 데이터베이스
- [ ] `users` 테이블 생성 확인
- [ ] `posts` 테이블 생성 확인
- [ ] `likes` 테이블 생성 확인
- [ ] `comments` 테이블 생성 확인
- [ ] `follows` 테이블 생성 확인
- [ ] 모든 인덱스 생성 확인
- [ ] `post_stats` 뷰 생성 확인
- [ ] `user_stats` 뷰 생성 확인
- [ ] `handle_updated_at` 함수 생성 확인
- [ ] `posts` 테이블 트리거 생성 확인
- [ ] `comments` 테이블 트리거 생성 확인
- [ ] RLS 상태 확인 (개발: 비활성화)

### Storage
- [ ] `posts` 버킷 생성 확인
- [ ] 버킷이 공개(public)로 설정되었는지 확인
- [ ] 파일 크기 제한이 5MB로 설정되었는지 확인
- [ ] 허용 MIME 타입이 올바르게 설정되었는지 확인

### 통합 테스트
- [ ] 데이터베이스 연결 테스트 통과
- [ ] 인증 테스트 통과
- [ ] Storage 업로드 테스트 통과 (선택사항)

## 참고 자료

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase SQL Editor 가이드](https://supabase.com/docs/guides/database/tables)
- [Supabase Storage 가이드](https://supabase.com/docs/guides/storage)



