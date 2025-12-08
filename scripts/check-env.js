/**
 * 환경 변수 확인 스크립트
 * 
 * 이 스크립트는 필수 환경 변수가 설정되었는지 확인합니다.
 * 
 * 사용 방법:
 * node scripts/check-env.js
 */

const requiredEnvVars = {
  // Clerk
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': {
    description: 'Clerk Publishable Key',
    format: 'pk_test_... 또는 pk_live_...',
    required: true,
  },
  'CLERK_SECRET_KEY': {
    description: 'Clerk Secret Key (서버 사이드 전용)',
    format: 'sk_test_... 또는 sk_live_...',
    required: true,
  },
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'Supabase Project URL',
    format: 'https://xxxxx.supabase.co',
    required: true,
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase Anon Key',
    format: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Supabase Service Role Key (서버 사이드 전용)',
    format: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  },
  // Storage
  'NEXT_PUBLIC_STORAGE_BUCKET': {
    description: 'Supabase Storage Bucket Name',
    format: 'posts 또는 uploads',
    required: true,
  },
};

const optionalEnvVars = {
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL': {
    description: 'Clerk Sign In URL',
    default: '/sign-in',
  },
  'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL': {
    description: 'Clerk Sign In Fallback Redirect URL',
    default: '/',
  },
  'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL': {
    description: 'Clerk Sign Up Fallback Redirect URL',
    default: '/',
  },
};

console.log('🔍 환경 변수 확인 중...\n');

let hasErrors = false;
let hasWarnings = false;

// 필수 환경 변수 확인
console.log('📋 필수 환경 변수:');
for (const [key, config] of Object.entries(requiredEnvVars)) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.log(`  ❌ ${key}`);
    console.log(`     설명: ${config.description}`);
    console.log(`     형식: ${config.format}`);
    console.log(`     상태: 설정되지 않음\n`);
    hasErrors = true;
  } else {
    // 형식 검증
    let isValid = true;
    if (key === 'CLERK_SECRET_KEY' && !value.startsWith('sk_')) {
      isValid = false;
    } else if (key === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY' && !value.startsWith('pk_')) {
      isValid = false;
    } else if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('https://')) {
      isValid = false;
    } else if (
      (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' || key === 'SUPABASE_SERVICE_ROLE_KEY') &&
      !value.startsWith('eyJ')
    ) {
      isValid = false;
    }

    if (!isValid) {
      console.log(`  ⚠️  ${key}`);
      console.log(`     설명: ${config.description}`);
      console.log(`     형식: ${config.format}`);
      console.log(`     상태: 형식이 올바르지 않을 수 있음`);
      console.log(`     값: ${value.substring(0, 20)}...\n`);
      hasWarnings = true;
    } else {
      console.log(`  ✅ ${key}`);
      console.log(`     값: ${value.substring(0, 20)}...\n`);
    }
  }
}

// 선택적 환경 변수 확인
console.log('📋 선택적 환경 변수:');
for (const [key, config] of Object.entries(optionalEnvVars)) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.log(`  ⚠️  ${key} (기본값 사용: ${config.default})`);
  } else {
    console.log(`  ✅ ${key} = ${value}`);
  }
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ 필수 환경 변수가 설정되지 않았습니다!');
  console.log('\n해결 방법:');
  console.log('1. 프로젝트 루트에 .env.local 파일 생성');
  console.log('2. 다음 환경 변수를 추가:');
  console.log('   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  console.log('   - CLERK_SECRET_KEY');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('   - NEXT_PUBLIC_STORAGE_BUCKET');
  console.log('\n자세한 내용은 docs/ENV_SETUP.md를 참고하세요.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  일부 환경 변수의 형식이 올바르지 않을 수 있습니다.');
  console.log('Clerk Dashboard와 Supabase Dashboard에서 올바른 키를 복사했는지 확인하세요.');
  process.exit(0);
} else {
  console.log('\n✅ 모든 필수 환경 변수가 올바르게 설정되었습니다!');
  process.exit(0);
}

