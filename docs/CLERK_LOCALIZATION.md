# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하고 커스터마이징하는 방법을 설명합니다.

## 기본 설정

프로젝트의 `app/layout.tsx`에서 이미 한국어 로컬라이제이션이 적용되어 있습니다:

```tsx
import { koKR } from '@clerk/localizations';

<ClerkProvider localization={koKR}>
  {/* ... */}
</ClerkProvider>
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다:
- 한국어 (ko-KR) - `koKR`
- 영어 (en-US) - `enUS` (기본값)
- 일본어 (ja-JP) - `jaJP`
- 중국어 간체 (zh-CN) - `zhCN`
- 중국어 번체 (zh-TW) - `zhTW`
- 기타 50개 이상의 언어

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization#languages)를 참고하세요.

## 커스터마이징

### 기본 한국어 로컬라이제이션 사용

```tsx
import { koKR } from '@clerk/localizations';

<ClerkProvider localization={koKR}>
  {/* ... */}
</ClerkProvider>
```

### 특정 텍스트 커스터마이징

기본 `koKR`을 확장하여 특정 텍스트를 커스터마이징할 수 있습니다:

```tsx
import { koKR } from '@clerk/localizations';

const koreanLocalization = {
  ...koKR,
  // 회원가입 화면 커스터마이징
  signUp: {
    start: {
      subtitle: "{{applicationName}}에 가입하여 계속하세요",
    },
    emailCode: {
      subtitle: "{{applicationName}}에 가입하여 계속하세요",
    },
  },
  // 로그인 화면 커스터마이징
  signIn: {
    start: {
      subtitle: "{{applicationName}}에 로그인하여 계속하세요",
    },
  },
  // 버튼 텍스트 커스터마이징
  formButtonPrimary: "계속하기",
  formButtonReset: "초기화",
};

<ClerkProvider localization={koreanLocalization}>
  {/* ... */}
</ClerkProvider>
```

### 에러 메시지 커스터마이징

Clerk의 기본 에러 메시지를 한국어로 커스터마이징할 수 있습니다:

```tsx
import { koKR } from '@clerk/localizations';

const koreanLocalization = {
  ...koKR,
  unstable__errors: {
    // 허용되지 않은 접근 시 메시지
    not_allowed_access:
      '접근 권한이 없습니다. 회사 이메일 도메인을 허용 목록에 추가하려면 이메일을 보내주세요.',
    // 잘못된 이메일 형식
    form_identifier_not_found:
      '입력하신 이메일 주소를 찾을 수 없습니다.',
    // 비밀번호가 너무 짧음
    form_password_pwned:
      '이 비밀번호는 보안상 위험합니다. 다른 비밀번호를 사용해주세요.',
    // 기타 에러 메시지들...
  },
};

<ClerkProvider localization={koreanLocalization}>
  {/* ... */}
</ClerkProvider>
```

### 전체 커스터마이징 예시

```tsx
import { koKR } from '@clerk/localizations';

const customKoreanLocalization = {
  ...koKR,
  // 회원가입
  signUp: {
    start: {
      title: "계정 만들기",
      subtitle: "{{applicationName}}에 가입하여 시작하세요",
    },
    emailCode: {
      title: "이메일 인증",
      subtitle: "{{applicationName}}에 가입하여 계속하세요",
    },
  },
  // 로그인
  signIn: {
    start: {
      title: "로그인",
      subtitle: "{{applicationName}}에 로그인하여 계속하세요",
    },
  },
  // 버튼
  formButtonPrimary: "계속하기",
  formButtonReset: "초기화",
  formButtonSecondary: "취소",
  // 에러 메시지
  unstable__errors: {
    not_allowed_access:
      '접근 권한이 없습니다. 문의사항이 있으시면 고객지원팀에 연락해주세요.',
    form_identifier_not_found:
      '입력하신 이메일 주소를 찾을 수 없습니다.',
    form_password_pwned:
      '이 비밀번호는 보안상 위험합니다. 다른 비밀번호를 사용해주세요.',
  },
};

<ClerkProvider localization={customKoreanLocalization}>
  {/* ... */}
</ClerkProvider>
```

## 커스터마이징 가능한 키 목록

주요 커스터마이징 가능한 키들:

### 회원가입 관련
- `signUp.start.title` - 회원가입 시작 화면 제목
- `signUp.start.subtitle` - 회원가입 시작 화면 부제목
- `signUp.emailCode.title` - 이메일 인증 화면 제목
- `signUp.emailCode.subtitle` - 이메일 인증 화면 부제목

### 로그인 관련
- `signIn.start.title` - 로그인 시작 화면 제목
- `signIn.start.subtitle` - 로그인 시작 화면 부제목

### 버튼 텍스트
- `formButtonPrimary` - 주요 버튼 텍스트 (예: "계속하기", "로그인")
- `formButtonReset` - 초기화 버튼 텍스트
- `formButtonSecondary` - 보조 버튼 텍스트

### 에러 메시지
- `unstable__errors.not_allowed_access` - 접근 권한 없음
- `unstable__errors.form_identifier_not_found` - 이메일을 찾을 수 없음
- `unstable__errors.form_password_pwned` - 보안상 위험한 비밀번호

전체 키 목록은 [Clerk GitHub 저장소의 영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)을 참고하세요.

## 주의사항

1. **실험적 기능**: 로컬라이제이션 기능은 현재 실험적(experimental)입니다. 예상치 못한 동작이 발생할 수 있습니다.

2. **Clerk Account Portal**: 로컬라이제이션은 앱 내 Clerk 컴포넌트에만 적용됩니다. 호스팅된 [Clerk Account Portal](https://clerk.com/docs/guides/customizing-clerk/account-portal)은 여전히 영어로 표시됩니다.

3. **변수 사용**: 일부 텍스트에서 `{{applicationName}}`과 같은 변수를 사용할 수 있습니다. 이는 Clerk Dashboard에서 설정한 애플리케이션 이름으로 자동 대체됩니다.

## 현재 프로젝트 설정

현재 프로젝트는 `app/layout.tsx`에서 기본 `koKR` 로컬라이제이션을 사용하고 있습니다. 추가 커스터마이징이 필요한 경우 해당 파일을 수정하세요.

## 참고 자료

- [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [Clerk GitHub - 로컬라이제이션 패키지](https://github.com/clerk/javascript/tree/main/packages/localizations)
- [영어 로컬라이제이션 파일 (전체 키 참고용)](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)

