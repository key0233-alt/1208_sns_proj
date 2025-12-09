# 🚨 Clerk Secret Key 설정 가이드

## 현재 문제
```
Clerk: Handshake token verification failed: The provided Clerk Secret Key is invalid.
```

이 에러는 `CLERK_SECRET_KEY` 환경 변수가 설정되지 않았거나 잘못되었을 때 발생합니다.

## 해결 방법

### 1단계: Clerk Dashboard에서 키 가져오기

1. **Clerk Dashboard 접속**
   - https://dashboard.clerk.com/ 에 로그인
   - 프로젝트 선택

2. **API Keys 페이지로 이동**
   - 좌측 메뉴에서 **"API Keys"** 클릭
   - 또는 **"Configure"** → **"API Keys"**

3. **두 개의 키 복사**
   - **Publishable key**: `pk_test_...` 또는 `pk_live_...`로 시작
   - **Secret key**: `sk_test_...` 또는 `sk_live_...`로 시작 ⚠️ **중요!**

   **주의**: Secret key는 "Show" 버튼을 클릭해야 표시됩니다.

### 2단계: .env.local 파일에 키 추가

프로젝트 루트 디렉토리(`package.json`이 있는 위치)의 `.env.local` 파일을 열고 다음 내용을 추가하세요:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_여기에_실제_키_붙여넣기
CLERK_SECRET_KEY=sk_test_여기에_실제_키_붙여넣기
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

**중요 사항:**
- ✅ `CLERK_SECRET_KEY`는 **"Secret key"**를 사용하세요 (Publishable key 아님!)
- ✅ 키 형식: `sk_test_...` 또는 `sk_live_...`로 시작해야 함
- ✅ 따옴표(`"`) 없이 입력
- ✅ 등호(`=`) 앞뒤 공백 없이 입력
- ✅ 키 끝에 공백이나 줄바꿈 없이 입력

### 3단계: 개발 서버 재시작

**중요**: 환경 변수를 변경한 후에는 반드시 개발 서버를 재시작해야 합니다!

1. 현재 실행 중인 개발 서버를 완전히 종료
   - 터미널에서 `Ctrl+C` 누르기
   - 모든 프로세스가 종료될 때까지 대기

2. 개발 서버 다시 시작
   ```bash
   pnpm dev
   ```

### 4단계: 확인

환경 변수가 올바르게 설정되었는지 확인:

```bash
pnpm check-env
```

모든 필수 환경 변수가 ✅ 표시되면 성공입니다!

## 자주 하는 실수

### ❌ 잘못된 예시

```env
# 따옴표 사용 (불필요)
CLERK_SECRET_KEY="sk_test_..."

# Publishable key 사용 (잘못됨)
CLERK_SECRET_KEY=pk_test_...

# 공백 포함
CLERK_SECRET_KEY = sk_test_...

# 잘못된 키 형식
CLERK_SECRET_KEY=test_...
```

### ✅ 올바른 예시

```env
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 문제가 계속되면

1. **파일 위치 확인**
   - `.env.local` 파일이 프로젝트 루트에 있는지 확인
   - `package.json`과 같은 디렉토리에 있어야 함

2. **키 형식 확인**
   - `CLERK_SECRET_KEY`가 `sk_test_` 또는 `sk_live_`로 시작하는지 확인
   - Clerk Dashboard에서 다시 복사

3. **서버 완전 재시작**
   - 터미널을 완전히 닫고 새로 열기
   - `pnpm dev` 다시 실행

4. **캐시 삭제**
   ```bash
   # .next 폴더 삭제 후 재시작
   Remove-Item -Recurse -Force .next
   pnpm dev
   ```

## 추가 도움말

- 자세한 환경 변수 설정: [`docs/ENV_SETUP.md`](docs/ENV_SETUP.md)
- 빠른 해결 가이드: [`QUICK_FIX.md`](QUICK_FIX.md)



