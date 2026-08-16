"use client";

import { useState } from "react";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { Card } from "@/components/ui/Card";
import type { CustomizeData, EquipCandidate } from "@/lib/game/customizeData";

const CATEGORY_LABEL: Record<string, string> = { hair: "헤어", outfit: "한벌옷", hat: "모자", accessory: "소품" };
const CATEGORIES: EquipCandidate["category"][] = ["hair", "outfit", "hat", "accessory"];

export function CustomizeScreen({ data }: { data: CustomizeData }) {
  const [appearance, setAppearance] = useState(data.appearance);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEquip(item: EquipCandidate) {
    if (!data.canEdit || equipping) return;
    setEquipping(item.inventoryItemId);
    setError(null);
    try {
      const res = await fetch("/api/character/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: data.characterId, inventoryItemId: item.inventoryItemId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "failed");
      setAppearance(result.appearance);
    } catch {
      setError("착용에 실패했어요. 다시 시도해주세요.");
    } finally {
      setEquipping(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="text-center">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">{data.nickname} 꾸미기</h1>
        <p className="text-[12px] text-[var(--color-navy-soft)]">{data.roleLabel}</p>
      </div>

      <div className="flex justify-center">
        <div className="rounded-[28px] bg-white p-3 shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
          <CharacterSprite
            appearance={appearance}
            kind={data.kind}
            childGender={data.childGender}
            childStage={data.childStage}
            size={170}
          />
        </div>
      </div>

      {!data.canEdit && (
        <p className="text-center text-[13px] text-[var(--color-navy-soft)]">이 캐릭터는 내가 관리할 수 없어요.</p>
      )}
      {error && <p className="text-center text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}

      {CATEGORIES.map((cat) => {
        const items = data.candidates.filter((c) => c.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <p className="mb-2 text-[14px] font-extrabold text-[var(--color-navy)]">{CATEGORY_LABEL[cat]}</p>
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => (
                <button
                  key={item.inventoryItemId}
                  onClick={() => handleEquip(item)}
                  disabled={!data.canEdit || equipping === item.inventoryItemId}
                  className="text-left"
                >
                  <Card className="!p-3 text-center">
                    <p className="line-clamp-1 text-[12px] font-bold text-[var(--color-navy)]">
                      {equipping === item.inventoryItemId ? "착용 중..." : item.name}
                    </p>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {data.candidates.length === 0 && (
        <Card tone="cream" className="py-8 text-center text-[14px] text-[var(--color-navy-soft)]">
          착용 가능한 아이템이 아직 없어요. 낚시터·본뿌리·선내식당에서 모아볼까요?
        </Card>
      )}
    </div>
  );
}
