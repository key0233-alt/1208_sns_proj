-- ============================================
-- Migration: Create Posts Storage Bucket
-- Created: 2025-12-08
-- Description: Create public storage bucket for post images
-- ============================================
-- This migration creates the 'posts' storage bucket for storing post images.
-- Bucket settings:
-- - Name: posts
-- - Public: true (public read access)
-- - File size limit: 5MB (PRD.md specification)
-- - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- ============================================
-- Note: RLS policies are optional for development
-- ============================================

-- 버킷 생성 (이미 존재하면 무시됨)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- public bucket (공개 읽기)
  5242880,  -- 5MB 제한 (5 * 1024 * 1024) - PRD.md 기준
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- ============================================
-- RLS 정책 (개발 단계에서는 선택사항)
-- ============================================
-- 프로덕션 환경을 위한 기본 정책 예시
-- 개발 단계에서는 RLS를 비활성화할 수 있습니다

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Public can read posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own posts" ON storage.objects;

-- SELECT: 공개 읽기 (모든 사용자가 게시물 이미지 조회 가능)
-- 개발 단계에서는 이 정책을 생성하지 않아도 됩니다 (RLS 비활성화 시)
-- CREATE POLICY "Public can read posts"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'posts');

-- INSERT: 인증된 사용자만 업로드 가능
-- 개발 단계에서는 이 정책을 생성하지 않아도 됩니다 (RLS 비활성화 시)
-- CREATE POLICY "Authenticated users can upload posts"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'posts');

-- DELETE: 본인 게시물만 삭제 가능
-- 개발 단계에서는 이 정책을 생성하지 않아도 됩니다 (RLS 비활성화 시)
-- CREATE POLICY "Users can delete own posts"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'posts'
--   -- 추가: 게시물 소유자 확인 로직 필요
-- );



