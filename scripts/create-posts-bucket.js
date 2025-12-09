/**
 * @file create-posts-bucket.js
 * @description 'posts' Storage 버킷 생성 스크립트
 * 
 * 이 스크립트는 Supabase에 'posts' Storage 버킷을 생성합니다.
 * Service Role Key를 사용하여 직접 SQL을 실행합니다.
 * 
 * 실행 방법:
 * node scripts/create-posts-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 또는 .env 파일에서 환경 변수 읽기
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach((line) => {
        // 주석 제거 및 빈 줄 건너뛰기
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          return;
        }
        
        const match = trimmedLine.match(/^([^=:#]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          // 따옴표 제거
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      console.log(`✅ ${envFile} 파일에서 환경 변수를 로드했습니다.`);
      break;
    }
  }
}

loadEnvFile();

async function createPostsBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    console.error('필요한 환경 변수:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\n.env.local 파일을 확인하세요.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🔄 posts 버킷 생성 중...\n');

  // SQL 쿼리 실행
  const sqlQuery = `
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
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
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];
  `;

  try {
    // Supabase JavaScript 클라이언트는 직접 SQL을 실행할 수 없으므로
    // RPC 함수를 사용하거나, 여기서는 버킷 존재 여부를 확인하고
    // 없다면 사용자에게 SQL을 실행하도록 안내합니다.
    
    // 먼저 버킷이 이미 존재하는지 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ 버킷 목록 조회 실패:', listError.message);
      console.error('\n대안: Supabase Dashboard에서 직접 SQL을 실행하세요.');
      console.error('\n1. Supabase Dashboard → SQL Editor');
      console.error('2. 다음 SQL을 실행:');
      console.error('\n' + sqlQuery);
      process.exit(1);
    }

    const postsBucketExists = buckets?.some((b) => b.id === 'posts');
    
    if (postsBucketExists) {
      console.log('✅ posts 버킷이 이미 존재합니다.');
      const postsBucket = buckets.find((b) => b.id === 'posts');
      console.log('\n버킷 정보:');
      console.log(`  - ID: ${postsBucket.id}`);
      console.log(`  - Public: ${postsBucket.public ? '✅' : '❌'}`);
      console.log(`  - File size limit: ${postsBucket.file_size_limit ? `${postsBucket.file_size_limit / 1024 / 1024}MB` : '없음'}`);
      console.log(`  - Allowed MIME types: ${postsBucket.allowed_mime_types?.join(', ') || '없음'}`);
      return;
    }

    // 버킷이 없으면 SQL 실행 안내
    console.log('❌ posts 버킷이 존재하지 않습니다.');
    console.log('\nSupabase JavaScript 클라이언트는 직접 SQL을 실행할 수 없습니다.');
    console.log('다음 방법 중 하나를 사용하세요:\n');
    
    console.log('📋 방법 1: Supabase Dashboard 사용 (권장)');
    console.log('1. Supabase Dashboard → SQL Editor');
    console.log('2. "New query" 클릭');
    console.log('3. 다음 SQL을 복사하여 붙여넣기:');
    console.log('\n' + '='.repeat(60));
    console.log(sqlQuery);
    console.log('='.repeat(60));
    console.log('\n4. "Run" 클릭하여 실행');
    console.log('5. 성공 메시지 확인\n');
    
    console.log('📋 방법 2: Supabase CLI 사용');
    console.log('1. Supabase CLI 설치: npm install -g supabase');
    console.log('2. Supabase 로그인: supabase login');
    console.log('3. 프로젝트 연결: supabase link --project-ref YOUR_PROJECT_REF');
    console.log('4. 마이그레이션 실행: supabase db push');
    console.log('   또는 SQL 파일 직접 실행: supabase db execute -f supabase/migrations/20251208142252_create_posts_storage_bucket.sql\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('\n대안: Supabase Dashboard에서 직접 SQL을 실행하세요.');
    console.error('\n1. Supabase Dashboard → SQL Editor');
    console.error('2. 다음 SQL을 실행:');
    console.error('\n' + sqlQuery);
    process.exit(1);
  }
}

createPostsBucket()
  .then(() => {
    console.log('\n✅ 완료!');
  })
  .catch((error) => {
    console.error('\n❌ 실패:', error);
    process.exit(1);
  });

