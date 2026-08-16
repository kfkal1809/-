"use client";

import { CharacterSprite } from "@/components/character/CharacterSprite";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";
import type { ClothingCharacterOption } from "@/lib/game/clothingStoreData";

// 피팅룸 — 기존 CharacterSprite를 그대로 재사용한다(별도 렌더러를 새로 만들지 않음).
// size를 고정해두면 CharacterSprite 자체가 outfitAssetKey/fullPortraitKey/구버전 렌더링
// 방식 모두에서 "머리~발끝 실제 높이"를 동일하게 계산해주므로, 의상을 계속 바꿔도
// 캐릭터 키가 점프하지 않는다(HEAD_MARGIN_TOP 보정이 이미 CharacterSprite 내부에 있음).
export function ClothingFittingRoom({
  appearance,
  kind,
  childGender,
  childStage,
  characters,
  selectedCharacterId,
  onSwitchCharacter,
}: {
  appearance: CharacterAppearance;
  kind: CharacterKind;
  childGender: ChildGender | null;
  childStage: ChildStage | null;
  characters: ClothingCharacterOption[];
  selectedCharacterId: string | null;
  onSwitchCharacter: (characterId: string) => void;
}) {
  const idx = characters.findIndex((c) => c.id === selectedCharacterId);
  const current = idx >= 0 ? characters[idx] : characters[0];

  function cycle(direction: 1 | -1) {
    if (characters.length < 2) return;
    const nextIdx = ((idx < 0 ? 0 : idx) + direction + characters.length) % characters.length;
    onSwitchCharacter(characters[nextIdx].id);
  }

  return (
    <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-b from-[var(--color-cream)] to-[var(--color-sky)]">
      {characters.length > 1 && (
        <button
          onClick={() => cycle(-1)}
          aria-label="이전 캐릭터"
          className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-navy)] shadow"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      <div className="absolute bottom-6 h-4 w-32 rounded-full bg-black/10 blur-[3px]" />
      <div className="relative z-[1] flex flex-col items-center gap-2">
        <CharacterSprite appearance={appearance} kind={kind} childGender={childGender} childStage={childStage} size={168} />
        {current && <p className="rounded-full bg-white/85 px-3 py-0.5 text-[12px] font-bold text-[var(--color-navy)]">{current.nickname}</p>}
      </div>

      {characters.length > 1 && (
        <button
          onClick={() => cycle(1)}
          aria-label="다음 캐릭터"
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-navy)] shadow"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
