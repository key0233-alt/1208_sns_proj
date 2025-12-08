/**
 * @file types.ts
 * @description SNS 프로젝트의 TypeScript 타입 정의
 *
 * 데이터베이스 스키마를 기반으로 한 타입 정의입니다.
 * Supabase에서 반환되는 데이터 구조와 일치합니다.
 *
 * @see {@link supabase/migrations/db.sql} - 데이터베이스 스키마
 */

/**
 * 사용자 타입
 * Clerk 인증과 연동되는 사용자 정보
 */
export interface User {
  /** UUID (Primary Key) */
  id: string;
  /** Clerk User ID (Unique) */
  clerk_id: string;
  /** 사용자 이름 */
  name: string;
  /** 생성 시간 (ISO 8601) */
  created_at: string;
}

/**
 * 게시물 타입
 */
export interface Post {
  /** UUID (Primary Key) */
  id: string;
  /** 작성자 User ID (UUID) */
  user_id: string;
  /** Supabase Storage 이미지 URL */
  image_url: string;
  /** 캡션 (최대 2,200자, 애플리케이션에서 검증) */
  caption: string | null;
  /** 생성 시간 (ISO 8601) */
  created_at: string;
  /** 수정 시간 (ISO 8601) */
  updated_at: string;
}

/**
 * 좋아요 타입
 */
export interface Like {
  /** UUID (Primary Key) */
  id: string;
  /** 게시물 ID (UUID) */
  post_id: string;
  /** 좋아요한 사용자 ID (UUID) */
  user_id: string;
  /** 생성 시간 (ISO 8601) */
  created_at: string;
}

/**
 * 댓글 타입
 */
export interface Comment {
  /** UUID (Primary Key) */
  id: string;
  /** 게시물 ID (UUID) */
  post_id: string;
  /** 작성자 User ID (UUID) */
  user_id: string;
  /** 댓글 내용 */
  content: string;
  /** 생성 시간 (ISO 8601) */
  created_at: string;
  /** 수정 시간 (ISO 8601) */
  updated_at: string;
}

/**
 * 팔로우 타입
 */
export interface Follow {
  /** UUID (Primary Key) */
  id: string;
  /** 팔로우하는 사용자 ID (UUID) */
  follower_id: string;
  /** 팔로우받는 사용자 ID (UUID) */
  following_id: string;
  /** 생성 시간 (ISO 8601) */
  created_at: string;
}

/**
 * 게시물 통계 뷰 타입
 * post_stats 뷰에서 반환되는 데이터
 */
export interface PostStats {
  /** 게시물 ID (UUID) */
  post_id: string;
  /** 작성자 User ID (UUID) */
  user_id: string;
  /** 이미지 URL */
  image_url: string;
  /** 캡션 */
  caption: string | null;
  /** 생성 시간 (ISO 8601) */
  created_at: string;
  /** 좋아요 수 */
  likes_count: number;
  /** 댓글 수 */
  comments_count: number;
}

/**
 * 사용자 통계 뷰 타입
 * user_stats 뷰에서 반환되는 데이터
 */
export interface UserStats {
  /** 사용자 ID (UUID) */
  user_id: string;
  /** Clerk User ID */
  clerk_id: string;
  /** 사용자 이름 */
  name: string;
  /** 게시물 수 */
  posts_count: number;
  /** 팔로워 수 */
  followers_count: number;
  /** 팔로잉 수 */
  following_count: number;
}

/**
 * 게시물 생성 입력 타입
 */
export interface CreatePostInput {
  /** 이미지 파일 (File 객체) */
  image: File;
  /** 캡션 (최대 2,200자) */
  caption?: string;
}

/**
 * 댓글 생성 입력 타입
 */
export interface CreateCommentInput {
  /** 게시물 ID (UUID) */
  post_id: string;
  /** 댓글 내용 */
  content: string;
}

/**
 * API 응답 타입 (공통)
 */
export interface ApiResponse<T> {
  /** 성공 여부 */
  success: boolean;
  /** 데이터 */
  data?: T;
  /** 에러 메시지 */
  error?: string;
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  /** 페이지 크기 (기본값: 10) */
  limit?: number;
  /** 오프셋 (기본값: 0) */
  offset?: number;
}

/**
 * 게시물 목록 응답 타입
 */
export interface PostListResponse {
  /** 게시물 목록 */
  posts: PostStats[];
  /** 전체 개수 */
  total: number;
  /** 다음 페이지 존재 여부 */
  hasMore: boolean;
}

