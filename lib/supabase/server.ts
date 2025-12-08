import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Supabase 서버 클라이언트 생성 함수 (Server Component/Server Action용)
 *
 * 공식 문서 패턴: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * Clerk + Supabase 네이티브 통합 (2025년 권장 방식):
 * - JWT 템플릿 불필요 (deprecated)
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 * - 여러 파일에서 재사용 가능 (page.tsx, Server Actions 등)
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('instruments').select('*');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Server Action
 * 'use server'
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function addTask(name: string) {
 *   const supabase = await createClient();
 *   const { data, error } = await supabase.from('tasks').insert({ name });
 *   return { data, error };
 * }
 * ```
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
}

/**
 * @deprecated createClient()를 사용하세요.
 * 하위 호환성을 위해 유지됩니다.
 */
export async function createServerSupabaseClient() {
  return createClient();
}

/**
 * @deprecated createClient()를 사용하세요.
 * 하위 호환성을 위해 유지됩니다.
 */
export const createClerkSupabaseClient = createClient;
