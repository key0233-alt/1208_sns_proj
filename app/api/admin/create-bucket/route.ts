/**
 * @file app/api/admin/create-bucket/route.ts
 * @description Storage 버킷 생성 API (개발용)
 * 
 * 이 API는 개발 환경에서 'posts' Storage 버킷을 생성합니다.
 * Service Role Key를 사용하여 직접 SQL을 실행합니다.
 * 
 * ⚠️ 주의: 프로덕션 환경에서는 이 API를 비활성화하거나 제거하세요.
 */

import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST() {
  // 개발 환경에서만 실행 가능하도록 제한 (선택사항)
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is not available in production" },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceRoleClient();

    // 먼저 버킷이 이미 존재하는지 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("[Create Bucket] List buckets error:", listError);
      return NextResponse.json(
        {
          error: "Failed to list buckets",
          details: listError.message,
        },
        { status: 500 }
      );
    }

    const postsBucketExists = buckets?.some((b) => b.id === "posts");

    if (postsBucketExists) {
      const postsBucket = buckets?.find((b) => b.id === "posts");
      return NextResponse.json({
        success: true,
        message: "Bucket 'posts' already exists",
        bucket: {
          id: postsBucket?.id,
          public: postsBucket?.public,
          file_size_limit: postsBucket?.file_size_limit,
          allowed_mime_types: postsBucket?.allowed_mime_types,
        },
      });
    }

    // Supabase JavaScript 클라이언트는 직접 SQL을 실행할 수 없으므로
    // 사용자에게 SQL을 실행하도록 안내
    const sqlQuery = `INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];`;

    return NextResponse.json(
      {
        error: "Bucket creation requires SQL execution",
        message: "Please execute the following SQL in Supabase Dashboard → SQL Editor",
        sql: sqlQuery,
        instructions: [
          "1. Go to Supabase Dashboard → SQL Editor",
          "2. Click 'New query'",
          "3. Copy and paste the SQL query above",
          "4. Click 'Run' to execute",
          "5. Verify the bucket was created in Storage → Buckets",
        ],
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Create Bucket] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

