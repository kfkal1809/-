// 하단탭/메뉴 아이콘을 눌렀을 때 다음 화면 데이터(Supabase 조회)가 오는 동안 화면이
// 그대로 멈춰 있어(App Router는 loading.tsx가 없으면 이전 화면을 그대로 둔 채 아무
// 피드백 없이 기다리다가 한 번에 전환한다) "반응이 느리다"는 느낌을 준다. 이 파일이
// 있으면 Next.js가 클릭 즉시 이 스켈레톤을 보여주고(AppFrame/BottomNav는 그대로 유지된
// 채 content 영역만 교체), 실제 데이터가 도착하면 새 화면으로 바뀐다 — 실제 조회 시간이
// 줄어드는 건 아니지만 클릭에 대한 반응 자체는 즉시 눈에 보인다.
export default function GameLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--color-sky-deep)] border-t-[var(--color-tab-active)]" />
    </div>
  );
}
