# Clerk + Supabase 통합 설정 가이드

이 문서는 Clerk와 Supabase를 네이티브 통합 방식으로 설정하는 방법을 설명합니다.

> **중요**: 2025년 4월부터 Clerk의 네이티브 Supabase 통합을 사용합니다. JWT Template은 더 이상 필요하지 않으며 deprecated되었습니다.

## 통합 방식의 장점

- ✅ JWT 템플릿 불필요
- ✅ 각 Supabase 요청마다 새 토큰을 가져올 필요 없음
- ✅ Supabase JWT secret key를 Clerk와 공유할 필요 없음
- ✅ 더 간단하고 안전한 통합

## 설정 단계

### 1. Clerk Dashboard에서 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **"Integrations"** 또는 **"Setup"** → **"Supabase"** 클릭
4. **"Activate Supabase integration"** 버튼 클릭
5. 표시되는 **Clerk domain**을 복사 (예: `your-app-12.clerk.accounts.dev`)
   - 이 도메인은 다음 단계에서 사용합니다

### 2. Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **"Authentication"** → **"Providers"** 클릭
4. 페이지 하단의 **"Third-Party Auth"** 섹션으로 스크롤
5. **"Add Provider"** 또는 **"Enable Custom Access Token"** 클릭
6. 다음 정보 입력:
   - **Provider Name**: `Clerk` (또는 원하는 이름)
   - **JWT Issuer (Issuer URL)**: 
     ```
     https://your-app-12.clerk.accounts.dev
     ```
     (1단계에서 복사한 Clerk domain으로 교체)
   - **JWKS Endpoint (JWKS URI)**:
     ```
     https://your-app-12.clerk.accounts.dev/.well-known/jwks.json
     ```
     (동일하게 실제 Clerk domain으로 교체)
7. **"Save"** 또는 **"Add Provider"** 클릭

### 3. 통합 확인

통합이 올바르게 설정되었는지 확인하려면:

1. Clerk로 로그인
2. `/auth-test` 페이지에서 Supabase 연결 테스트
3. Supabase Dashboard → **"Authentication"** → **"Users"**에서 Clerk 사용자가 표시되는지 확인

## 코드에서 사용하기

### Client Component

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';

export default function MyComponent() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const { data } = await supabase.from('tasks').select('*');
      console.log(data);
    }

    fetchData();
  }, [user, supabase]);

  return <div>...</div>;
}
```

### Server Component

```tsx
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from('tasks').select('*');
  
  return <div>...</div>;
}
```

### Server Action

```ts
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function addTask(name: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });
  
  return { data, error };
}
```

## RLS 정책 설정

Clerk 사용자 ID를 기반으로 RLS 정책을 설정합니다:

```sql
-- 테이블 생성
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub'
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "User can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- INSERT 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);
```

## 문제 해결

### "Invalid JWT" 오류

- Clerk Dashboard에서 Supabase 통합이 활성화되었는지 확인
- Supabase Dashboard에서 Clerk provider 설정이 올바른지 확인
- Clerk domain이 정확히 입력되었는지 확인

### RLS 정책이 작동하지 않음

- `auth.jwt()->>'sub'`가 Clerk user ID를 반환하는지 확인
- RLS가 활성화되었는지 확인: `SELECT * FROM pg_tables WHERE tablename = 'your_table';`
- 정책이 올바르게 생성되었는지 확인

### 토큰이 전달되지 않음

- Client Component에서는 `useSession()`이 로드되었는지 확인
- Server Component에서는 `auth()`가 올바르게 호출되는지 확인
- 브라우저 개발자 도구에서 네트워크 요청 헤더 확인

## 참고 자료

- [Clerk 공식 Supabase 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/overview)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

