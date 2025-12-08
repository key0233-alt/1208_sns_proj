"use client";

import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요 (deprecated)
 * - useSession()으로 세션 객체 가져오기
 * - session?.getToken()으로 현재 세션 토큰 사용
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useUser } from '@clerk/nextjs';
 *
 * export default function MyComponent() {
 *   const { user } = useUser();
 *   const supabase = useClerkSupabaseClient();
 *
 *   useEffect(() => {
 *     if (!user) return;
 *
 *     async function fetchData() {
 *       const { data } = await supabase.from('tasks').select('*');
 *       console.log(data);
 *     }
 *
 *     fetchData();
 *   }, [user, supabase]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        async accessToken() {
          return session?.getToken() ?? null;
        },
      }
    );
  }, [session]);

  return supabase;
}
