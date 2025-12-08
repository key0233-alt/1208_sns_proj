# 환경 변수 설정 가이드

이 문서는 프로젝트에 필요한 모든 환경 변수를 설정하는 방법을 설명합니다.

## 빠른 시작

1. `.env.example` 파일을 복사하여 `.env.local` 파일 생성:
   ```bash
   cp .env.example .env.local
   ```

2. 아래 가이드를 따라 각 환경 변수를 설정합니다.

## Clerk 환경 변수

### 1. Clerk Dashboard에서 키 가져오기

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **"API Keys"** 클릭

### 2. 필요한 키 설정

**NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
- **위치**: API Keys 페이지의 **"Publishable key"** 섹션
- **형식**: `pk_test_...` 또는 `pk_live_...`
- **용도**: 클라이언트 사이드에서 Clerk 컴포넌트 사용
- **보안**: 공개되어도 안전 (NEXT_PUBLIC_ 접두사)

**CLERK_SECRET_KEY**
- **위치**: API Keys 페이지의 **"Secret key"** 섹션
- **형식**: `sk_test_...` 또는 `sk_live_...`
- **용도**: 서버 사이드에서 Clerk API 호출 (middleware, API routes)
- **보안**: 절대 공개하지 마세요! 서버 사이드 전용

**설정 예시:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Clerk URL 설정

**NEXT_PUBLIC_CLERK_SIGN_IN_URL**
- 로그인 페이지 경로
- 기본값: `/sign-in`

**NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL**
- 로그인 후 리다이렉트할 URL
- 기본값: `/`

**NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL**
- 회원가입 후 리다이렉트할 URL
- 기본값: `/`

**설정 예시:**
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

## Supabase 환경 변수

### 1. Supabase Dashboard에서 키 가져오기

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **"Settings"** → **"API"** 클릭

### 2. 필요한 키 설정

**NEXT_PUBLIC_SUPABASE_URL**
- **위치**: Settings → API 페이지의 **"Project URL"**
- **형식**: `https://xxxxxxxxxxxxx.supabase.co`
- **용도**: Supabase 프로젝트에 연결
- **보안**: 공개되어도 안전

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **위치**: Settings → API 페이지의 **"Project API keys"** → **`anon` `public`**
- **형식**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **용도**: 클라이언트/서버에서 Supabase API 호출
- **보안**: RLS 정책으로 보호됨

**SUPABASE_SERVICE_ROLE_KEY**
- **위치**: Settings → API 페이지의 **"Project API keys"** → **`service_role` `secret`**
- **형식**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **용도**: 서버 사이드에서 RLS 우회 (관리자 권한)
- **보안**: 절대 공개하지 마세요! 데이터베이스 비밀번호와 동일하게 취급

**설정 예시:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Storage 버킷 설정

**NEXT_PUBLIC_STORAGE_BUCKET**
- Supabase Storage 버킷 이름
- SNS 프로젝트: `posts`
- 기존 프로젝트: `uploads`

**설정 예시:**
```env
NEXT_PUBLIC_STORAGE_BUCKET=posts
```

## 환경 변수 파일 위치

### 개발 환경

`.env.local` 파일을 프로젝트 루트에 생성:
```bash
# Windows
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

### 프로덕션 환경

Vercel, Netlify 등 배포 플랫폼의 환경 변수 설정에서 추가:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

## 문제 해결

### "Clerk Secret Key is invalid" 에러

**원인:**
- `CLERK_SECRET_KEY` 환경 변수가 설정되지 않음
- 잘못된 키가 입력됨
- `.env.local` 파일이 로드되지 않음

**해결 방법:**

1. **환경 변수 확인:**
   ```bash
   # .env.local 파일이 존재하는지 확인
   ls -la .env.local  # macOS/Linux
   dir .env.local     # Windows
   ```

2. **키 형식 확인:**
   - `CLERK_SECRET_KEY`는 `sk_test_...` 또는 `sk_live_...`로 시작해야 합니다
   - Clerk Dashboard에서 **"Secret key"**를 복사했는지 확인 (Publishable key가 아님)

3. **Next.js 재시작:**
   - 환경 변수 변경 후 개발 서버를 완전히 종료하고 다시 시작:
   ```bash
   # Ctrl+C로 서버 종료 후
   pnpm dev
   ```

4. **환경 변수 로드 확인:**
   - `middleware.ts`나 서버 컴포넌트에서 확인:
   ```typescript
   console.log('CLERK_SECRET_KEY exists:', !!process.env.CLERK_SECRET_KEY);
   ```

### "Supabase URL or Service Role Key is missing" 에러

**원인:**
- `NEXT_PUBLIC_SUPABASE_URL` 또는 `SUPABASE_SERVICE_ROLE_KEY`가 설정되지 않음

**해결 방법:**
1. Supabase Dashboard에서 올바른 키를 복사했는지 확인
2. `.env.local` 파일에 올바르게 입력되었는지 확인
3. 개발 서버 재시작

## 보안 주의사항

### 절대 공개하지 마세요

다음 환경 변수는 절대 공개하면 안 됩니다:
- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 공개해도 안전한 변수

다음 환경 변수는 공개되어도 안전합니다:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (RLS로 보호됨)
- `NEXT_PUBLIC_SUPABASE_URL` (공개 정보)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (RLS로 보호됨)

### Git에 커밋하지 마세요

- `.env.local` 파일은 `.gitignore`에 포함되어 있습니다
- `.env.example` 파일만 커밋 (실제 키 없이 구조만)

## 전체 환경 변수 예시

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Storage
NEXT_PUBLIC_STORAGE_BUCKET=posts
```

## 참고 자료

- [Clerk 환경 변수 문서](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase 환경 변수 문서](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs#declare-supabase-environment-variables)
- [Next.js 환경 변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

