"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { playSfx } from "@/lib/audio/audioManager";
import { relativeTimeKorean } from "@/lib/game/relativeTime";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { DateSpotLocation } from "@/lib/domain/constants";
import type { DatePhotoRow } from "@/lib/game/datePhotoData";

// RewardPopup과 동일한 장식 프레임(모서리만 그림, 가운데는 투명)을 "인증샷" 테두리로
// 재사용한다 — public/images/ui/reward_popup_frame.png 실측 가로:세로 비율.
const FRAME_SRC = "/images/ui/reward_popup_frame.png";
const FRAME_ASPECT = 480 / 853;

export function DatePhotoWidget({
  locations,
  haenyeoName,
  haenyeoAppearance,
  haenamName,
  haenamAppearance,
  todayPhoto,
  recentPhotos,
}: {
  locations: DateSpotLocation[];
  haenyeoName: string;
  haenyeoAppearance: CharacterAppearance;
  haenamName: string;
  haenamAppearance: CharacterAppearance;
  todayPhoto: DatePhotoRow | null;
  recentPhotos: DatePhotoRow[];
}) {
  const router = useRouter();
  const [bgId, setBgId] = useState(todayPhoto?.bgId ?? locations[0].key);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(!!todayPhoto);

  async function handleSave() {
    if (submitting || saved) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/date/photo/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bgId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      playSfx("item-get");
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message === "already_done_today" ? "오늘은 이미 인증샷을 남겼어요." : "저장에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        {locations.map((loc) => (
          <button
            key={loc.key}
            onClick={() => setBgId(loc.key)}
            className={`flex flex-col items-center gap-1 rounded-xl p-1 ${bgId === loc.key ? "ring-2 ring-[var(--color-coral)]" : ""}`}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <Image src={`/images/backgrounds/${loc.key}.jpg`} alt="" fill unoptimized style={{ objectFit: "cover" }} />
            </div>
            <span className="text-[10px] font-bold text-[var(--color-navy-soft)]">{loc.label}</span>
          </button>
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-[300px]" style={{ aspectRatio: FRAME_ASPECT }}>
        <Image src={`/images/backgrounds/${bgId}.jpg`} alt="" fill unoptimized style={{ objectFit: "cover" }} className="rounded-[18px]" />
        <Image src={FRAME_SRC} alt="" fill unoptimized className="pointer-events-none object-contain" />
        <div className="absolute inset-x-0 bottom-[10%] z-10 flex items-end justify-center gap-1.5">
          <div className="flex flex-col items-center">
            <CharacterSprite appearance={haenyeoAppearance} kind="haenyeo" size={78} />
            <p className="mt-1 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[var(--color-navy)]">
              {haenyeoName}
            </p>
          </div>
          <Image src="/images/home/deco-heart.png" alt="" aria-hidden width={623} height={490} unoptimized className="mb-6 w-4" style={{ height: "auto" }} />
          <div className="flex flex-col items-center">
            <CharacterSprite appearance={haenamAppearance} kind="haenam" size={78} />
            <p className="mt-1 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[var(--color-navy)]">
              {haenamName}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        {saved ? (
          <p className="text-[13px] font-bold text-[var(--color-mint-deep)]">오늘의 인증샷을 남겼어요!</p>
        ) : (
          <button
            onClick={handleSave}
            disabled={submitting}
            className="rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[14px] font-bold text-white active:scale-95 disabled:opacity-60"
          >
            {submitting ? "저장 중..." : "이 장소에서 인증샷 남기기"}
          </button>
        )}
        {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
      </div>

      {recentPhotos.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-[var(--color-navy)]">
            <GameIcon name="camera" size={20} />
            우리의 데이트 앨범
          </p>
          <div className="grid grid-cols-3 gap-2">
            {recentPhotos.map((p) => {
              const loc = locations.find((l) => l.key === p.bgId);
              return (
                <Card key={p.id} className="flex flex-col items-center gap-1 !p-1.5">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image src={`/images/backgrounds/${p.bgId}.jpg`} alt="" fill unoptimized style={{ objectFit: "cover" }} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-navy-soft)]">{loc?.label ?? p.bgId}</span>
                  <span className="text-[9px] text-[var(--color-navy-soft)]">{relativeTimeKorean(p.createdAt)}</span>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
