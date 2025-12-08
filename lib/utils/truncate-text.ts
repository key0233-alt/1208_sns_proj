/**
 * @file truncate-text.ts
 * @description 텍스트 자르기 유틸리티
 *
 * 긴 텍스트를 특정 길이로 자르고 말줄임표를 추가합니다.
 * 캡션 등에서 사용됩니다.
 */

/**
 * 텍스트를 특정 길이로 자르고 말줄임표 추가
 *
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이 (기본값: 100)
 * @returns 자른 텍스트
 *
 * @example
 * truncateText("이것은 매우 긴 텍스트입니다...", 10) // "이것은 매우 긴..."
 */
export function truncateText(text: string | null | undefined, maxLength = 100): string {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + "...";
}

/**
 * 텍스트가 특정 길이를 초과하는지 확인
 *
 * @param text - 확인할 텍스트
 * @param maxLength - 최대 길이 (기본값: 100)
 * @returns 초과 여부
 */
export function isTextTruncated(text: string | null | undefined, maxLength = 100): boolean {
  if (!text) {
    return false;
  }

  return text.length > maxLength;
}

