# Supabase 환경 변수 가이드

이 문서는 Supabase 프로젝트에서 사용하는 환경 변수에 대해 설명합니다.

## 필수 환경 변수

### `NEXT_PUBLIC_SUPABASE_URL`

Supabase 프로젝트의 URL입니다.

**설정 방법:**
1. Supabase Dashboard → **Settings** → **API**
2. **Project URL** 복사
3. `.env` 파일에 추가:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   ```

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase의 공개(anon) 키입니다. 클라이언트에서 사용되며, RLS 정책에 따라 데이터 접근이 제한됩니다.

**참고:** 
- 공식 문서에서는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`라는 이름을 사용하기도 하지만, 실제로는 `anon` key와 동일합니다.
- 이 프로젝트에서는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용합니다.

**설정 방법:**
1. Supabase Dashboard → **Settings** → **API**
2. **Project API keys** 섹션에서 **`anon` `public`** 키 복사
3. `.env` 파일에 추가:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### `SUPABASE_SERVICE_ROLE_KEY`

Supabase의 서비스 역할 키입니다. **절대 클라이언트에 노출하면 안 됩니다!**

**주의사항:**
- 서버 사이드에서만 사용
- RLS를 우회하여 모든 데이터에 접근 가능
- 데이터베이스 비밀번호와 동일하게 취급

**설정 방법:**
1. Supabase Dashboard → **Settings** → **API**
2. **Project API keys** 섹션에서 **`service_role` `secret`** 키 복사
3. `.env` 파일에 추가 (`.env.local` 권장):
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### `NEXT_PUBLIC_STORAGE_BUCKET`

Supabase Storage 버킷 이름입니다. 기본값은 `uploads`입니다.

```env
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

## 환경 변수 이름 비교

| 이 프로젝트 | 공식 문서 | 설명 |
|------------|----------|------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 공개 키 (anon key) |
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | 프로젝트 URL (동일) |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | 서비스 역할 키 (동일) |

**참고:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`와 `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 동일한 값을 가리키며, Supabase Dashboard에서 `anon` key로 표시됩니다.

## 환경 변수 사용 예시

### 서버 사이드 (Server Component / Server Action)

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = await createClient();
  // NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 사용
  const { data } = await supabase.from('instruments').select('*');
  return <div>...</div>;
}
```

### 클라이언트 사이드 (Client Component)

```typescript
'use client';
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  // NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 사용
  const { data } = await supabase.from('instruments').select('*');
  return <div>...</div>;
}
```

### 관리자 권한 (Service Role)

```typescript
import { getServiceRoleClient } from '@/lib/supabase/service-role';

export async function adminFunction() {
  const supabase = getServiceRoleClient();
  // NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 사용
  // RLS를 우회하여 모든 데이터에 접근 가능
  const { data } = await supabase.from('users').select('*');
  return data;
}
```

## 보안 주의사항

1. **`NEXT_PUBLIC_` 접두사**: 이 접두사가 붙은 변수는 클라이언트 번들에 포함됩니다.
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`: 공개되어도 안전
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`: RLS 정책으로 보호됨
   - ❌ `SUPABASE_SERVICE_ROLE_KEY`: 절대 `NEXT_PUBLIC_` 접두사 사용 금지!

2. **환경 변수 파일**:
   - `.env.local`: 로컬 개발용 (Git에 커밋하지 않음)
   - `.env.example`: 예시 파일 (실제 키 없이 구조만)
   - `.gitignore`에 `.env.local` 추가 확인

3. **키 노출 시 조치**:
   - `SUPABASE_SERVICE_ROLE_KEY`가 노출되면 즉시 Supabase Dashboard에서 키 재생성
   - 노출된 키로 인한 데이터 손상 가능성 확인

## 참고 자료

- [Supabase 환경 변수 문서](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs#declare-supabase-environment-variables)
- [Supabase API 키 설명](https://supabase.com/docs/guides/api/api-keys)
- [Next.js 환경 변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

