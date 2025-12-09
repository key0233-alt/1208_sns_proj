/**
 * @file error-handler.ts
 * @description 에러 핸들링 유틸리티
 *
 * API 에러 및 네트워크 에러를 처리하고 사용자 친화적인 메시지를 제공합니다.
 */

/**
 * API 에러 타입
 */
export interface ApiError {
  error?: string;
  details?: string;
  message?: string;
}

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    );
  }
  return false;
}

/**
 * API 응답에서 에러 메시지 추출
 */
export async function extractErrorMessage(
  response: Response
): Promise<string> {
  try {
    // 응답 본문이 있는지 확인
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return getHttpErrorMessage(response.status);
    }

    // 응답 본문 읽기
    const responseText = await response.clone().text();
    
    // 빈 응답인 경우
    if (!responseText || responseText.trim().length === 0) {
      return getHttpErrorMessage(response.status);
    }

    // JSON 파싱
    const data: ApiError = JSON.parse(responseText);
    
    // 에러 메시지 추출
    if (data.error && data.details) {
      return `${data.error}: ${data.details}`;
    }
    if (data.error) {
      return data.error;
    }
    if (data.message) {
      return data.message;
    }
    if (data.details) {
      return data.details;
    }
    
    // 빈 객체인 경우
    return getHttpErrorMessage(response.status);
  } catch (error) {
    // JSON 파싱 실패 시 HTTP 상태 메시지 사용
    console.error("[extractErrorMessage] Failed to parse error response:", error);
    return getHttpErrorMessage(response.status);
  }
}

/**
 * HTTP 상태 코드에 따른 사용자 친화적 에러 메시지
 */
export function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "잘못된 요청입니다.";
    case 401:
      return "로그인이 필요합니다.";
    case 403:
      return "권한이 없습니다.";
    case 404:
      return "요청한 리소스를 찾을 수 없습니다.";
    case 409:
      return "이미 처리된 요청입니다.";
    case 413:
      return "파일 크기가 너무 큽니다.";
    case 429:
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    case 500:
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    case 503:
      return "서비스를 일시적으로 사용할 수 없습니다.";
    default:
      return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 에러를 사용자 친화적인 메시지로 변환
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "네트워크 연결을 확인해주세요.";
  }

  if (error instanceof Error) {
    // 이미 사용자 친화적인 메시지인 경우 그대로 반환
    if (
      error.message.includes("로그인") ||
      error.message.includes("권한") ||
      error.message.includes("네트워크")
    ) {
      return error.message;
    }

    // 기술적인 에러 메시지는 일반적인 메시지로 변환
    return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * API 호출 래퍼 (에러 핸들링 포함)
 */
export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorMessage = await extractErrorMessage(response);
      return { error: errorMessage };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    const errorMessage = getUserFriendlyErrorMessage(error);
    return { error: errorMessage };
  }
}

