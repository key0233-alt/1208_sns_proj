# 🚨 CLERK_SECRET_KEY 길이 문제 해결 가이드

## 현재 문제

터미널 출력에서 확인된 문제:
```
[Middleware] CLERK_SECRET_KEY 존재: true
[Middleware] CLERK_SECRET_KEY 길이: 50 ⚠️ (일반적으로 51자)
[Middleware] CLERK_SECRET_KEY 시작: sk_test_teritf8mtMqE
[Middleware] CLERK_SECRET_KEY 끝: qYP8457JL2
```

**문제**: CLERK_SECRET_KEY가 50자로 1자 부족합니다. 키 끝 부분이 잘렸을 가능성이 높습니다.

## 원인

- 키를 복사할 때 마지막 문자가 누락됨
- `.env.local` 파일에 키를 입력할 때 마지막 문자가 잘림
- 키 끝에 공백이나 줄바꿈이 있어서 잘림

## 해결 방법

### 1단계: Clerk Dashboard에서 키 다시 복사

1. **Clerk Dashboard 접속**
   - https://dashboard.clerk.com/ 접속
   - 올바른 프로젝트 선택

2. **API Keys 페이지로 이동**
   - 좌측 메뉴에서 **"API Keys"** 클릭

3. **Secret Key 복사**
   - Secret key 섹션에서 **"Show"** 버튼 클릭
   - 키 전체를 처음부터 끝까지 복사
   - ⚠️ **마지막 문자가 잘리지 않도록 주의**
   - 일반적으로 51자여야 합니다

### 2단계: .env.local 파일 수정

프로젝트 루트의 `.env.local` 파일을 열고:

**현재 상태 (잘림):**
```env
CLERK_SECRET_KEY=sk_test_teritf8mtMqES1WXfNna8WBYObAYCYtVqYP8457JL2
```

**수정 후 (전체):**
```env
CLERK_SECRET_KEY=sk_test_teritf8mtMqES1WXfNna8WBYObAYCYtVqYP8457JL2C
```

**중요 사항:**
- ✅ 키 끝에 공백이나 줄바꿈 없음
- ✅ 마지막 문자까지 모두 포함 (51자)
- ✅ 따옴표(`"`) 없이 입력
- ✅ 등호(`=`) 앞뒤 공백 없음

### 3단계: 개발 서버 재시작

**중요**: 환경 변수를 변경한 후에는 반드시 개발 서버를 완전히 재시작해야 합니다!

```bash
# 1. 서버 종료 (Ctrl+C)
# 2. 캐시 삭제
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. 서버 재시작
pnpm dev
```

### 4단계: 확인

서버 재시작 후 터미널에 다음이 출력되어야 합니다:

```
[Middleware] CLERK_SECRET_KEY 존재: true
[Middleware] CLERK_SECRET_KEY 길이: 51 ✅
[Middleware] CLERK_SECRET_KEY 시작: sk_test_teritf8mtMqE
[Middleware] CLERK_SECRET_KEY 끝: ...8457JL2C
```

길이가 51자로 표시되면 성공입니다!

## 키 복사 팁

1. **전체 선택 후 복사**
   - 키를 클릭하여 전체 선택
   - Ctrl+C로 복사
   - 마지막 문자가 포함되었는지 확인

2. **수동으로 마지막 문자 확인**
   - 복사한 키를 메모장에 붙여넣기
   - 마지막 문자가 보이는지 확인
   - 일반적으로 알파벳 대문자나 숫자로 끝남

3. **키 길이 확인**
   - 복사한 키의 길이가 51자인지 확인
   - 50자면 마지막 문자가 누락된 것

## 문제가 계속되면

1. **키 형식 확인**
   - `sk_test_` 또는 `sk_live_`로 시작하는지 확인
   - 키에 특수 문자가 포함되어 있는지 확인

2. **파일 인코딩 확인**
   - `.env.local` 파일이 UTF-8로 저장되었는지 확인
   - BOM 없이 저장되었는지 확인

3. **환경 변수 확인 스크립트 실행**
   ```bash
   pnpm check-env
   ```

4. **Clerk Dashboard에서 키 재생성**
   - 키가 손상되었을 수 있으므로 새로 생성
   - API Keys 페이지에서 "Regenerate" 버튼 클릭

## 참고

- Clerk Secret Key는 일반적으로 51자입니다
- 키 끝에 공백이나 줄바꿈이 있으면 잘릴 수 있습니다
- 키를 복사할 때 마지막 문자까지 포함하는 것이 중요합니다

