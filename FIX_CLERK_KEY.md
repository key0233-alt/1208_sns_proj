# 🚨 Clerk Publishable Key 에러 해결 가이드

## 현재 에러
```
Publishable key not valid.
```

이 에러는 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`가 설정되지 않았거나 잘못된 키가 입력되었을 때 발생합니다.

## 즉시 해결 방법

### 1단계: Clerk Dashboard에서 올바른 키 가져오기

1. **Clerk Dashboard 접속**
   - https://dashboard.clerk.com/ 에 로그인
   - 올바른 프로젝트 선택 (⚠️ 프로젝트를 잘못 선택했을 수 있습니다)

2. **API Keys 페이지로 이동**
   - 좌측 메뉴에서 **"API Keys"** 클릭
   - 또는 **"Configure"** → **"API Keys"**

3. **두 개의 키 확인 및 복사**
   - **Publishable key**: `pk_test_...` 또는 `pk_live_...`로 시작
     - ⚠️ **"pk_test_" 또는 "pk_live_"로 시작해야 합니다**
   - **Secret key**: `sk_test_...` 또는 `sk_live_...`로 시작
     - ⚠️ **"Show" 버튼을 클릭해야 표시됩니다**

### 2단계: .env.local 파일 수정

프로젝트 루트 디렉토리(`package.json`이 있는 위치)의 `.env.local` 파일을 열고:

**현재 상태 (잘못됨):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_여기에_실제_키_붙여넣기
CLERK_SECRET_KEY=sk_test_여기에_실제_키_붙여넣기
```

**올바른 형식:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
```

**중요 사항:**
- ✅ `pk_test_` 또는 `pk_live_`로 시작하는 실제 키를 입력하세요
- ✅ `sk_test_` 또는 `sk_live_`로 시작하는 실제 키를 입력하세요
- ✅ 따옴표(`"`) 없이 입력
- ✅ 등호(`=`) 앞뒤 공백 없이 입력
- ✅ 키 끝에 공백이나 줄바꿈 없이 입력
- ✅ 템플릿 텍스트("여기에_실제_키_붙여넣기")를 실제 키로 교체해야 합니다

### 3단계: 개발 서버 완전 재시작

**중요**: 환경 변수를 변경한 후에는 반드시 개발 서버를 완전히 재시작해야 합니다!

1. **현재 실행 중인 개발 서버 완전히 종료**
   - 터미널에서 `Ctrl+C` 누르기
   - 모든 프로세스가 종료될 때까지 대기
   - 터미널 창을 완전히 닫고 새로 열 수도 있습니다

2. **캐시 삭제 (선택사항, 문제가 계속되면)**
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```

3. **개발 서버 다시 시작**
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
# 템플릿 텍스트 그대로 (가장 흔한 실수)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_여기에_실제_키_붙여넣기

# 따옴표 사용 (불필요)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# 공백 포함
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...

# 잘못된 키 형식 (pk_로 시작하지 않음)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=test_...

# Secret key를 Publishable key에 사용 (잘못됨)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=sk_test_...
```

### ✅ 올바른 예시

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
```

## 문제가 계속되면

1. **프로젝트 확인**
   - Clerk Dashboard에서 올바른 프로젝트를 선택했는지 확인
   - 다른 프로젝트의 키를 사용하고 있지 않은지 확인

2. **키 형식 재확인**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`가 `pk_test_` 또는 `pk_live_`로 시작하는지 확인
   - Clerk Dashboard에서 다시 복사

3. **파일 위치 확인**
   - `.env.local` 파일이 프로젝트 루트에 있는지 확인
   - `package.json`과 같은 디렉토리에 있어야 함

4. **서버 완전 재시작**
   - 터미널을 완전히 닫고 새로 열기
   - `.next` 폴더 삭제 후 재시작

5. **환경 변수 로드 확인**
   - 브라우저 개발자 도구 콘솔에서 확인:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
   ```
   - 서버 사이드에서는 로드되지 않으므로 클라이언트 컴포넌트에서만 확인 가능

## 추가 도움말

- 자세한 환경 변수 설정: [`docs/ENV_SETUP.md`](docs/ENV_SETUP.md)
- 빠른 해결 가이드: [`QUICK_FIX.md`](QUICK_FIX.md)
- Clerk 설정 가이드: [`CLERK_SETUP_GUIDE.md`](CLERK_SETUP_GUIDE.md)

