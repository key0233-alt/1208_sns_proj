/**
 * @file show-migration.js
 * @description 마이그레이션 SQL 파일 내용을 출력하는 스크립트
 *
 * 이 스크립트는 마이그레이션 SQL 파일의 내용을 읽어서 출력합니다.
 * Supabase Dashboard의 SQL Editor에 복사하여 붙여넣을 수 있도록 포맷팅합니다.
 *
 * 사용법:
 *   node scripts/show-migration.js [migration-name]
 *
 * 예시:
 *   node scripts/show-migration.js schema
 *   node scripts/show-migration.js storage
 */

const fs = require('fs');
const path = require('path');

// 마이그레이션 파일 매핑
const MIGRATIONS = {
  schema: '20251208142214_create_sns_schema.sql',
  storage: '20251208142252_create_posts_storage_bucket.sql',
};

/**
 * 마이그레이션 파일 읽기
 */
function readMigrationFile(migrationName) {
  const fileName = MIGRATIONS[migrationName];

  if (!fileName) {
    console.error(`❌ 알 수 없는 마이그레이션 이름: ${migrationName}`);
    console.error('\n사용 가능한 마이그레이션:');
    Object.keys(MIGRATIONS).forEach((key) => {
      console.error(`  - ${key}: ${MIGRATIONS[key]}`);
    });
    process.exit(1);
  }

  const filePath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    fileName
  );

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 마이그레이션 파일을 찾을 수 없습니다: ${filePath}`);
    process.exit(1);
  }

  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 메인 함수
 */
function main() {
  const migrationName = process.argv[2];

  if (!migrationName) {
    console.log('📋 사용 가능한 마이그레이션:');
    console.log('');
    Object.keys(MIGRATIONS).forEach((key) => {
      console.log(`  ${key}: ${MIGRATIONS[key]}`);
    });
    console.log('');
    console.log('사용법: node scripts/show-migration.js [migration-name]');
    console.log('예시: node scripts/show-migration.js schema');
    process.exit(0);
  }

  try {
    const sql = readMigrationFile(migrationName);
    const fileName = MIGRATIONS[migrationName];

    console.log('='.repeat(80));
    console.log(`📄 마이그레이션 파일: ${fileName}`);
    console.log('='.repeat(80));
    console.log('');
    console.log('다음 SQL을 Supabase Dashboard → SQL Editor에 복사하여 실행하세요:');
    console.log('');
    console.log('-'.repeat(80));
    console.log('');
    console.log(sql);
    console.log('');
    console.log('-'.repeat(80));
    console.log('');
    console.log('✅ 위 SQL을 복사하여 Supabase Dashboard → SQL Editor에 붙여넣고 실행하세요.');
  } catch (error) {
    console.error('❌ 에러 발생:');
    console.error(error.message);
    process.exit(1);
  }
}

main();

