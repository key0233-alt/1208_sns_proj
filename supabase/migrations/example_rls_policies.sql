-- Clerk + Supabase RLS 정책 예제
-- 
-- 이 파일은 Clerk와 Supabase 네이티브 통합을 사용할 때
-- Row Level Security (RLS) 정책을 설정하는 예제입니다.
--
-- 사용 방법:
-- 1. 이 파일을 참고하여 자신의 테이블에 맞게 수정
-- 2. Supabase Dashboard → SQL Editor에서 실행
-- 3. 또는 마이그레이션 파일로 저장하여 적용

-- ============================================
-- 예제 1: Tasks 테이블 (공식 문서 예제)
-- ============================================

-- 테이블 생성
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "User can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- INSERT 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- UPDATE 정책: 사용자는 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- DELETE 정책: 사용자는 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- ============================================
-- 예제 2: Posts 테이블 (블로그 포스트)
-- ============================================

-- 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 
-- - 모든 사용자는 published=true인 포스트만 조회 가능
-- - 작성자는 자신의 모든 포스트 조회 가능
CREATE POLICY "Anyone can view published posts"
ON posts
FOR SELECT
TO authenticated
USING (
  published = true OR
  (SELECT auth.jwt()->>'sub') = author_id
);

-- INSERT 정책: 인증된 사용자는 포스트 생성 가능
CREATE POLICY "Authenticated users can create posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = author_id
);

-- UPDATE 정책: 작성자만 자신의 포스트 수정 가능
CREATE POLICY "Authors can update their own posts"
ON posts
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = author_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = author_id
);

-- DELETE 정책: 작성자만 자신의 포스트 삭제 가능
CREATE POLICY "Authors can delete their own posts"
ON posts
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = author_id
);

-- ============================================
-- 예제 3: Comments 테이블 (댓글)
-- ============================================

-- 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 
-- - published 포스트의 댓글은 모두 조회 가능
-- - 작성자는 자신의 댓글 조회 가능
CREATE POLICY "Users can view comments on published posts"
ON comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND (posts.published = true OR posts.author_id = (SELECT auth.jwt()->>'sub'))
  )
  OR
  (SELECT auth.jwt()->>'sub') = author_id
);

-- INSERT 정책: 인증된 사용자는 댓글 생성 가능
CREATE POLICY "Authenticated users can create comments"
ON comments
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = author_id
  AND
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND posts.published = true
  )
);

-- UPDATE 정책: 작성자만 자신의 댓글 수정 가능
CREATE POLICY "Authors can update their own comments"
ON comments
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = author_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = author_id
);

-- DELETE 정책: 작성자만 자신의 댓글 삭제 가능
CREATE POLICY "Authors can delete their own comments"
ON comments
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = author_id
);

-- ============================================
-- 참고사항
-- ============================================

-- 1. auth.jwt()->>'sub'는 Clerk user ID를 반환합니다
-- 2. TO authenticated는 인증된 사용자에게만 정책을 적용합니다
-- 3. USING 절은 SELECT, UPDATE, DELETE에서 기존 행을 필터링합니다
-- 4. WITH CHECK 절은 INSERT, UPDATE에서 새 행/수정된 행을 검증합니다
-- 5. 개발 중에는 RLS를 비활성화할 수 있지만, 프로덕션에서는 필수입니다

-- RLS 비활성화 (개발용)
-- ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- RLS 활성화 (프로덕션용)
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 정책 삭제
-- DROP POLICY IF EXISTS "User can view their own tasks" ON tasks;

