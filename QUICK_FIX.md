# 🚨 Clerk Secret Key 에러 빠른 해결 가이드

## 문제
```
Clerk: Handshake token verification failed: The provided Clerk Secret Key is invalid.
```

## 즉시 해결 방법

### 1단계: `.env.local` 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하세요.

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**Windows (CMD):**
```cmd
type nul > .env.local
```

**macOS/Linux:**
```bash
touch .env.local
```

### 2단계: Clerk 키 가져오기

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **"API Keys"** 클릭
4. 다음 두 키를 복사:
   - **Publishable key** (예: `pk_test_...`)
   - **Secret key** (예: `sk_test_...`) ⚠️ **이것이 중요합니다!**

### 3단계: `.env.local` 파일에 추가

`.env.local` 파일을 열고 다음 내용을 추가하세요:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_여기에_실제_키_붙여넣기
CLERK_SECRET_KEY=sk_test_여기에_실제_키_붙여넣기
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase (나중에 설정 가능)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# NEXT_PUBLIC_STORAGE_BUCKET=posts
```

**중요:**
- `CLERK_SECRET_KEY`는 **"Secret key"**를 복사해야 합니다 (Publishable key가 아님!)
- 키 형식: `sk_test_...` 또는 `sk_live_...`로 시작해야 합니다
- 따옴표 없이 입력하세요

### 4단계: 개발 서버 재시작

1. 현재 실행 중인 개발 서버를 완전히 종료 (`Ctrl+C`)
2. 다시 시작:
   ```bash
   pnpm dev
   ```

### 5단계: 확인

에러가 사라졌는지 확인하세요. 여전히 에러가 발생하면:

1. **환경 변수 확인:**
   ```bash
   pnpm check-env
   ```

2. **`.env.local` 파일 위치 확인:**
   - 파일이 프로젝트 루트에 있어야 합니다
   - `package.json`과 같은 디렉토리에 있어야 합니다

3. **키 형식 확인:**
   - `CLERK_SECRET_KEY`가 `sk_test_` 또는 `sk_live_`로 시작하는지 확인
   - 공백이나 따옴표가 없는지 확인

## 자주 하는 실수

❌ **잘못된 예:**
```env
CLERK_SECRET_KEY="sk_test_..."  # 따옴표 사용 (불필요)
CLERK_SECRET_KEY=pk_test_...    # Publishable key 사용 (잘못됨)
CLERK_SECRET_KEY=sk_test_...    # 공백 포함
```

✅ **올바른 예:**
```env
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 추가 도움말

- 자세한 환경 변수 설정: [`docs/ENV_SETUP.md`](docs/ENV_SETUP.md)
- 문제 해결: [`docs/ENV_SETUP.md#문제-해결`](docs/ENV_SETUP.md#문제-해결)



