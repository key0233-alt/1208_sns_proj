# Supabase Storage Bucket 생성 가이드

## posts 버킷 생성

게시물 이미지를 저장하기 위한 `posts` 버킷을 생성해야 합니다.

### 방법 1: Supabase SQL Editor 사용 (권장)

1. Supabase Dashboard → **SQL Editor** 메뉴로 이동
2. **"New query"** 클릭
3. 아래 SQL을 복사하여 붙여넣기:

```sql
-- 버킷 생성 (이미 존재하면 업데이트)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- public bucket (공개 읽기)
  5242880,  -- 5MB 제한 (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];
```

4. **"Run"** 클릭하여 실행
5. 성공 메시지 확인

### 방법 2: Supabase Dashboard 사용

1. Supabase Dashboard → **Storage** 메뉴로 이동
2. **"New bucket"** 클릭
3. 버킷 정보 입력:
   - **Name**: `posts`
   - **Public bucket**: ✅ 체크 (공개 읽기)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
4. **"Create bucket"** 클릭

### 버킷 설정 확인

버킷이 생성되었는지 확인하려면:

1. Supabase Dashboard → **Storage** 메뉴
2. `posts` 버킷이 목록에 표시되는지 확인
3. 버킷을 클릭하여 설정 확인:
   - Public: ✅ 활성화
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

## 문제 해결

### "저장소 버킷을 찾을 수 없습니다" 에러

이 에러가 발생하면:
1. 위의 방법 중 하나를 사용하여 버킷 생성
2. 버킷 이름이 정확히 `posts`인지 확인 (대소문자 구분)
3. 브라우저를 새로고침하고 다시 시도

### 이미지 업로드 실패

1. 버킷이 생성되었는지 확인
2. 파일 크기가 5MB 이하인지 확인
3. 파일 형식이 JPEG, PNG, WebP, GIF 중 하나인지 확인
4. 브라우저 콘솔에서 에러 메시지 확인

