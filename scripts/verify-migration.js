/**
 * @file verify-migration.js
 * @description Supabase 데이터베이스 마이그레이션 검증 스크립트
 *
 * 이 스크립트는 Supabase 데이터베이스에 필요한 테이블, 뷰, 트리거가
 * 올바르게 생성되었는지 확인합니다.
 *
 * 사용법:
 *   node scripts/verify-migration.js
 *
 * @requires @supabase/supabase-js
 * @requires 환경 변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('필요한 환경 변수:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\n.env.local 파일을 확인하세요.');
  process.exit(1);
}

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 검증할 테이블 목록
const REQUIRED_TABLES = ['users', 'posts', 'likes', 'comments', 'follows'];
const REQUIRED_VIEWS = ['post_stats', 'user_stats'];
const REQUIRED_INDEXES = [
  { table: 'posts', indexes: ['idx_posts_user_id', 'idx_posts_created_at'] },
  { table: 'likes', indexes: ['idx_likes_post_id', 'idx_likes_user_id'] },
  { table: 'comments', indexes: ['idx_comments_post_id', 'idx_comments_user_id', 'idx_comments_created_at'] },
  { table: 'follows', indexes: ['idx_follows_follower_id', 'idx_follows_following_id'] },
];

// 검증 결과
const results = {
  tables: { passed: 0, failed: 0, details: [] },
  views: { passed: 0, failed: 0, details: [] },
  indexes: { passed: 0, failed: 0, details: [] },
  storage: { passed: false, details: [] },
};

/**
 * 테이블 존재 여부 확인
 */
async function verifyTables() {
  console.log('\n📊 테이블 검증 중...\n');

  for (const tableName of REQUIRED_TABLES) {
    try {
      // 간단한 쿼리로 테이블 존재 확인
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        // 테이블이 존재하지 않는 경우
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          results.tables.failed++;
          results.tables.details.push({
            name: tableName,
            status: '❌ 없음',
            error: '테이블이 존재하지 않습니다.',
          });
          console.log(`  ❌ ${tableName}: 테이블이 존재하지 않습니다.`);
        } else {
          // 다른 에러 (권한 문제 등)
          results.tables.failed++;
          results.tables.details.push({
            name: tableName,
            status: '⚠️ 확인 불가',
            error: error.message,
          });
          console.log(`  ⚠️ ${tableName}: 확인 불가 (${error.message})`);
        }
      } else {
        results.tables.passed++;
        results.tables.details.push({
          name: tableName,
          status: '✅ 존재',
        });
        console.log(`  ✅ ${tableName}: 존재`);
      }
    } catch (error) {
      results.tables.failed++;
      results.tables.details.push({
        name: tableName,
        status: '❌ 에러',
        error: error.message,
      });
      console.log(`  ❌ ${tableName}: 에러 발생 (${error.message})`);
    }
  }
}

/**
 * 뷰 존재 여부 확인
 */
async function verifyViews() {
  console.log('\n👁️ 뷰 검증 중...\n');

  for (const viewName of REQUIRED_VIEWS) {
    try {
      // 뷰 쿼리로 존재 확인
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(0);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          results.views.failed++;
          results.views.details.push({
            name: viewName,
            status: '❌ 없음',
            error: '뷰가 존재하지 않습니다.',
          });
          console.log(`  ❌ ${viewName}: 뷰가 존재하지 않습니다.`);
        } else {
          results.views.failed++;
          results.views.details.push({
            name: viewName,
            status: '⚠️ 확인 불가',
            error: error.message,
          });
          console.log(`  ⚠️ ${viewName}: 확인 불가 (${error.message})`);
        }
      } else {
        results.views.passed++;
        results.views.details.push({
          name: viewName,
          status: '✅ 존재',
        });
        console.log(`  ✅ ${viewName}: 존재`);
      }
    } catch (error) {
      results.views.failed++;
      results.views.details.push({
        name: viewName,
        status: '❌ 에러',
        error: error.message,
      });
      console.log(`  ❌ ${viewName}: 에러 발생 (${error.message})`);
    }
  }
}

/**
 * Storage 버킷 확인
 */
async function verifyStorage() {
  console.log('\n📦 Storage 버킷 검증 중...\n');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      results.storage.details.push({
        status: '⚠️ 확인 불가',
        error: error.message,
      });
      console.log(`  ⚠️ Storage 버킷 확인 불가: ${error.message}`);
      return;
    }

    const postsBucket = buckets?.find((bucket) => bucket.name === 'posts');

    if (postsBucket) {
      results.storage.passed = true;
      results.storage.details.push({
        name: 'posts',
        status: '✅ 존재',
        public: postsBucket.public,
        fileSizeLimit: postsBucket.file_size_limit,
        allowedMimeTypes: postsBucket.allowed_mime_types,
      });
      console.log(`  ✅ posts 버킷: 존재`);
      console.log(`     - Public: ${postsBucket.public ? '✅' : '❌'}`);
      console.log(`     - File size limit: ${postsBucket.file_size_limit ? `${postsBucket.file_size_limit / 1024 / 1024}MB` : '없음'}`);
      console.log(`     - Allowed MIME types: ${postsBucket.allowed_mime_types?.join(', ') || '없음'}`);
    } else {
      results.storage.details.push({
        status: '❌ 없음',
        error: 'posts 버킷이 존재하지 않습니다.',
      });
      console.log(`  ❌ posts 버킷: 존재하지 않습니다.`);
    }
  } catch (error) {
    results.storage.details.push({
      status: '❌ 에러',
      error: error.message,
    });
    console.log(`  ❌ Storage 버킷 확인 중 에러: ${error.message}`);
  }
}

/**
 * 검증 결과 요약 출력
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 검증 결과 요약');
  console.log('='.repeat(60));

  console.log(`\n📊 테이블: ${results.tables.passed}/${REQUIRED_TABLES.length} 통과`);
  console.log(`👁️ 뷰: ${results.views.passed}/${REQUIRED_VIEWS.length} 통과`);
  console.log(`📦 Storage: ${results.storage.passed ? '✅ 통과' : '❌ 실패'}`);

  const totalPassed =
    results.tables.passed +
    results.views.passed +
    (results.storage.passed ? 1 : 0);
  const totalRequired = REQUIRED_TABLES.length + REQUIRED_VIEWS.length + 1;

  console.log(`\n전체: ${totalPassed}/${totalRequired} 통과`);

  if (totalPassed === totalRequired) {
    console.log('\n✅ 모든 검증이 통과되었습니다!');
    console.log('마이그레이션이 올바르게 적용되었습니다.');
  } else {
    console.log('\n⚠️ 일부 검증이 실패했습니다.');
    console.log('\n다음 단계:');
    console.log('1. Supabase Dashboard → SQL Editor 접속');
    console.log('2. 다음 마이그레이션 파일들을 순서대로 실행:');
    console.log('   - supabase/migrations/20251208142214_create_sns_schema.sql');
    console.log('   - supabase/migrations/20251208142252_create_posts_storage_bucket.sql');
    console.log('3. 이 스크립트를 다시 실행하여 검증');
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🔍 Supabase 마이그레이션 검증 시작...\n');
  console.log(`Supabase URL: ${supabaseUrl}`);

  await verifyTables();
  await verifyViews();
  await verifyStorage();
  printSummary();

  // 실패한 항목이 있으면 종료 코드 1 반환
  const hasFailures =
    results.tables.failed > 0 ||
    results.views.failed > 0 ||
    !results.storage.passed;

  process.exit(hasFailures ? 1 : 0);
}

// 스크립트 실행
main().catch((error) => {
  console.error('\n❌ 검증 중 예상치 못한 에러 발생:');
  console.error(error);
  process.exit(1);
});

