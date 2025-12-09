import { clerkMiddleware } from "@clerk/nextjs/server";

// 환경 변수 확인 (디버깅용 - 민감한 정보는 로깅하지 않음)
if (process.env.NODE_ENV === "development") {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  console.log("[Middleware] CLERK_SECRET_KEY 존재:", !!secretKey);
  if (secretKey) {
    // Clerk Secret Key는 버전에 따라 길이가 다를 수 있으므로 형식만 확인
    const isValidFormat = secretKey.startsWith("sk_test_") || secretKey.startsWith("sk_live_");
    const isValidLength = secretKey.length >= 20; // 최소 길이만 확인
    console.log("[Middleware] CLERK_SECRET_KEY 형식:", isValidFormat ? "✅" : "⚠️", `(${secretKey.startsWith("sk_") ? "올바른 접두사" : "잘못된 접두사"})`);
    console.log("[Middleware] CLERK_SECRET_KEY 길이:", secretKey.length, isValidLength ? "✅" : "⚠️");
    // 보안상 키의 일부를 로깅하지 않음
  }
  
  console.log("[Middleware] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 존재:", !!publishableKey);
  if (publishableKey) {
    const isValidFormat = publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_");
    const isValidLength = publishableKey.length >= 50;
    console.log("[Middleware] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 형식:", isValidFormat ? "✅" : "⚠️");
    console.log("[Middleware] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 길이:", publishableKey.length, isValidLength ? "✅" : "⚠️");
    // Publishable Key는 공개되어도 괜찮지만, 일관성을 위해 로깅 제거
  }
}

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
