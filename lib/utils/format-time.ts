/**
 * @file format-time.ts
 * @description 상대 시간 포맷팅 유틸리티
 *
 * ISO 8601 형식의 날짜 문자열을 Instagram 스타일의 상대 시간으로 변환합니다.
 * 예: "방금 전", "3분 전", "2시간 전", "2024. 12. 08"
 */

/**
 * 상대 시간 포맷팅 함수
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 포맷팅된 시간 문자열
 *
 * @example
 * formatRelativeTime("2024-12-08T14:30:00Z") // "방금 전"
 * formatRelativeTime("2024-12-08T14:25:00Z") // "5분 전"
 * formatRelativeTime("2024-12-08T10:30:00Z") // "4시간 전"
 * formatRelativeTime("2024-12-01T14:30:00Z") // "2024. 12. 01"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 방금 전 (< 1분)
  if (diffSeconds < 60) {
    return "방금 전";
  }

  // N분 전 (< 1시간)
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  // N시간 전 (< 24시간)
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  // N일 전 (< 7일)
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  // 7일 이상: "YYYY. MM. DD" 형식
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}. ${month}. ${day}`;
}

