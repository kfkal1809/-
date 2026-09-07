"use client";

import { BaseAppearanceEditor } from "@/components/character/BaseAppearanceEditor";
import { haenyeoPreset } from "@/lib/domain/characterPresets";

// 캐릭터 꾸미기 화면(BaseAppearanceEditor)을 실제 인증/DB 없이 미리보기 위한 개발 전용
// 페이지 — 헤어 스타일 선택지가 정확히 몇 종 노출되는지, 존재하지 않는 선택값이 남지
// 않는지를 실제 컴포넌트로 확인한다. 저장 버튼은 실제 API를 호출하므로(인증 없이 실패)
// 여기서는 선택지 노출/미리보기 렌더링만 확인한다.
export default function QaCustomizePreview() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div style={{ padding: 20, background: "white", maxWidth: 420 }}>
      <h1 style={{ fontFamily: "monospace", fontSize: 14, marginBottom: 12 }}>
        해녀 캐릭터 꾸미기 미리보기 (390px 폭 기준)
      </h1>
      <BaseAppearanceEditor
        characterId="qa-preview"
        kind="haenyeo"
        department={null}
        childGender={null}
        childStage={null}
        initialAppearance={haenyeoPreset()}
        onSaved={() => {}}
        onClose={() => {}}
      />
    </div>
  );
}
