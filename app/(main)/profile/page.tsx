/**
 * @file page.tsx
 * @description 본인 프로필 리다이렉트 페이지
 *
 * /profile로 접근 시 본인 프로필로 리다이렉트합니다.
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileRedirectPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
    return null;
  }

  const supabase = await createClient();

  // Clerk userId로 Supabase users 테이블에서 user_id 찾기
  const { data: userData, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (error || !userData) {
    // 사용자를 찾을 수 없으면 홈으로 리다이렉트
    redirect("/");
    return null;
  }

  // 본인 프로필로 리다이렉트
  redirect(`/profile/${userData.id}`);
  return null;
}

