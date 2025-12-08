import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Supabase 공식 문서 예제를 기반으로 한 Instruments 페이지
 * 
 * 공식 문서: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * 이 페이지는 Supabase에서 instruments 테이블의 데이터를 조회하여 표시합니다.
 * Clerk 인증이 통합되어 있어 인증된 사용자만 접근 가능합니다.
 */
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase.from("instruments").select();

  if (error) {
    console.error("Error fetching instruments:", error);
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Instruments</h2>
      {instruments && instruments.length > 0 ? (
        <ul className="list-disc list-inside space-y-2">
          {instruments.map((instrument: any) => (
            <li key={instrument.id} className="text-lg">
              {instrument.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No instruments found.</p>
      )}
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
        {JSON.stringify(instruments, null, 2)}
      </pre>
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Supabase Instruments Example</h1>
        <p className="text-gray-600">
          This page demonstrates Supabase data fetching following the official documentation pattern.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Based on:{" "}
          <a
            href="https://supabase.com/docs/guides/getting-started/quickstarts/nextjs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Supabase Next.js Quickstart Guide
          </a>
        </p>
      </div>

      <Suspense fallback={<div>Loading instruments...</div>}>
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

