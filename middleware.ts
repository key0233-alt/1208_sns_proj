import { clerkMiddleware } from "@clerk/nextjs/server";

// 환경 변수 확인 (디버깅용)
if (process.env.NODE_ENV === "development") {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  console.log("[Middleware] CLERK_SECRET_KEY 존재:", !!secretKey);
  if (secretKey) {
    console.log("[Middleware] CLERK_SECRET_KEY 길이:", secretKey.length, secretKey.length === 51 ? "✅" : "⚠️ (일반적으로 51자)");
    console.log("[Middleware] CLERK_SECRET_KEY 시작:", secretKey.substring(0, 20));
    console.log("[Middleware] CLERK_SECRET_KEY 끝:", secretKey.substring(Math.max(0, secretKey.length - 10)));
  }
  
  console.log("[Middleware] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 존재:", !!publishableKey);
  if (publishableKey) {
    console.log("[Middleware] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 길이:", publishableKey.length, publishableKey.length >= 50 ? "✅" : "⚠️");
    console.log("[Middleware] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 시작:", publishableKey.substring(0, 20));
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
