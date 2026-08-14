// Supabase가 아직 연결되지 않았거나 일시적으로 응답하지 않을 때도 페이지가 500 대신
// 빈 상태로 렌더링되도록 감싸는 헬퍼. 서버 컴포넌트에서 직접 쿼리하는 짧은 페이지들에 사용한다.
export async function trySupabase<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
