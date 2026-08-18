"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import { RoomBackground } from "@/components/cabin/RoomBackground";
import { WALLPAPER_SWATCHES, FLOOR_SWATCHES, clampToZone, isInKeepOutZone } from "@/lib/domain/cabinDecor";
import { getPlacementDef, furnitureWrapperStyle, depthOf, zoneBoundsFor, wallTiltFor } from "@/lib/domain/cabinPlacement";
import { furnitureImageSrc, availableFacings, cycleFacing } from "@/lib/domain/furnitureFacingAssets";
import { playSfx } from "@/lib/audio/audioManager";
import type { PlacedFurniture, UnplacedFurniture } from "@/lib/game/cabinEditData";
import {
  RotateLeftIcon,
  RotateRightIcon,
  FlipIcon,
  FacingIcon,
  ShrinkIcon,
  GrowIcon,
  LayerForwardIcon,
  LayerBackIcon,
  PickupIcon,
} from "@/components/cabin/EditIcons";

let tempIdCounter = 0;

export function CabinEditor({
  spaceId,
  initialPlaced,
  initialUnplaced,
  initialWallpaper,
  initialFloor,
}: {
  spaceId: string | null;
  initialPlaced: PlacedFurniture[];
  initialUnplaced: UnplacedFurniture[];
  initialWallpaper: string | null;
  initialFloor: string | null;
}) {
  const router = useRouter();
  const roomRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState(initialPlaced);
  const [unplaced, setUnplaced] = useState(initialUnplaced);
  // 저장이 성공할 때마다 이 시점 상태를 "깨끗한 기준선"으로 갱신한다(취소/이탈 경고 판단용).
  const [savedPlaced, setSavedPlaced] = useState(initialPlaced);
  const [savedUnplaced, setSavedUnplaced] = useState(initialUnplaced);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [wallpaper, setWallpaper] = useState(initialWallpaper);
  const [floor, setFloor] = useState(initialFloor);
  const [decorSaving, setDecorSaving] = useState(false);

  const dirty = JSON.stringify(placed) !== JSON.stringify(savedPlaced);

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  async function pickDecor(kind: "wallpaper" | "floor", key: string) {
    if (!spaceId || decorSaving) return;
    const prevWallpaper = wallpaper;
    const prevFloor = floor;
    if (kind === "wallpaper") setWallpaper(key);
    else setFloor(key);
    setDecorSaving(true);
    try {
      const res = await fetch("/api/cabin/decor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId, [kind]: key }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setWallpaper(prevWallpaper);
      setFloor(prevFloor);
      setMessage("벽지/바닥재 변경에 실패했어요.");
    } finally {
      setDecorSaving(false);
    }
  }

  function updateSelected(patch: Partial<PlacedFurniture>) {
    setPlaced((prev) => prev.map((p) => (p.id === selectedId ? { ...p, ...patch } : p)));
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingId || !roomRef.current) return;
    const item = placed.find((p) => p.id === draggingId);
    if (!item) return;
    const def = getPlacementDef(item.sku);
    const bounds = zoneBoundsFor(def.placementType);
    const rect = roomRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / rect.width;
    const rawY = (e.clientY - rect.top) / rect.height;
    const { x, y } = clampToZone(rawX, rawY, bounds);
    // 바닥 가구는 문 앞/캐릭터가 서는 중앙 자리를 완전히 덮지 못하게 한다 — 그 구간에
    // 들어가는 좌표는 무시하고 직전 유효 위치를 유지(드래그를 계속하다가 keep-out 밖으로
    // 나오면 다시 따라오기 시작함).
    if (def.placementType === "floor" && isInKeepOutZone(x, y)) return;
    setPlaced((prev) => prev.map((p) => (p.id === draggingId ? { ...p, x, y } : p)));
  }

  function addFromBag(item: UnplacedFurniture) {
    const def = getPlacementDef(item.sku);
    const bounds = zoneBoundsFor(def.placementType);
    const maxZ = placed.reduce((max, p) => Math.max(max, p.zIndex), 0);
    const newItem: PlacedFurniture = {
      id: `new:${tempIdCounter++}`,
      inventoryItemId: item.inventoryItemId,
      sku: item.sku,
      name: item.name,
      x: (bounds.xMin + bounds.xMax) / 2,
      y: (bounds.yMin + bounds.yMax) / 2,
      scale: def.defaultScale,
      rotation: 0,
      flipX: false,
      zIndex: maxZ + 1,
      facing: def.defaultFacing,
    };
    setPlaced((prev) => [...prev, newItem]);
    setUnplaced((prev) => prev.filter((u) => u.inventoryItemId !== item.inventoryItemId));
    setSelectedId(newItem.id);
    playSfx("furniture-place");
  }

  function removeSelected() {
    const item = placed.find((p) => p.id === selectedId);
    if (!item) return;
    setPlaced((prev) => prev.filter((p) => p.id !== selectedId));
    setUnplaced((prev) => [...prev, { inventoryItemId: item.inventoryItemId, sku: item.sku, name: item.name }]);
    setSelectedId(null);
    playSfx("furniture-pickup");
  }

  function bringForward() {
    const maxZ = placed.reduce((max, p) => Math.max(max, p.zIndex), 0);
    updateSelected({ zIndex: maxZ + 1 });
  }

  function sendBackward() {
    const minZ = placed.reduce((min, p) => Math.min(min, p.zIndex), 0);
    updateSelected({ zIndex: minZ - 1 });
  }

  // 방향 전환 — 실제로 다른 각도 그림이 있는 가구(furnitureFacingAssets.ts)만 다음 방향으로
  // 순환한다. x/y/scale/rotation/flipX는 그대로 두고 facing만 바꾸므로 바닥/벽 anchor는
  // furnitureWrapperStyle 계산에서 안 흔들린다 — 그림만 같은 자리에서 바뀐다.
  function cycleSelectedFacing() {
    if (!selected || !selected.sku) return;
    const next = cycleFacing(selected.sku, selected.facing ?? getPlacementDef(selected.sku).defaultFacing);
    if (next === selected.facing) return;
    updateSelected({ facing: next });
    playSfx("furniture-place");
  }

  function handleCancel() {
    if (dirty && !window.confirm("저장하지 않은 변경사항이 있어요. 편집 시작 전으로 되돌릴까요?")) return;
    setPlaced(savedPlaced);
    setUnplaced(savedUnplaced);
    setSelectedId(null);
    setMessage(null);
  }

  async function handleSave() {
    if (!spaceId) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cabin/save-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId,
          items: placed.map((p) => ({
            inventoryItemId: p.inventoryItemId,
            x: p.x,
            y: p.y,
            scale: p.scale,
            rotation: p.rotation,
            flipX: p.flipX,
            zIndex: p.zIndex,
            facing: p.facing,
          })),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setMessage("저장했어요!");
      setSavedPlaced(placed);
      setSavedUnplaced(unplaced);
      router.refresh();
    } catch {
      setMessage("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  const selected = placed.find((p) => p.id === selectedId) ?? null;
  const selectedDef = selected ? getPlacementDef(selected.sku) : null;

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">방꾸미기</h1>
        <div className="flex gap-2">
          {dirty && (
            <Button tone="outline" onClick={handleCancel} className="!px-4 !py-2 text-[13px]">
              취소
            </Button>
          )}
          <Button tone="coral" onClick={handleSave} disabled={saving || !spaceId} className="!px-4 !py-2 text-[14px]">
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
      {message && <p className="text-center text-[13px] font-bold text-[var(--color-navy)]">{message}</p>}

      <div
        ref={roomRef}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDraggingId(null)}
        onPointerLeave={() => setDraggingId(null)}
        className="relative aspect-[1473/909] w-full touch-none overflow-hidden rounded-[28px] border-2 border-white shadow-[0_6px_20px_rgba(36,54,90,0.10)]"
      >
        <RoomBackground wallpaper={wallpaper} floor={floor} />

        {[...placed]
          .sort((a, b) => depthOf(a.y, a.zIndex) - depthOf(b.y, b.zIndex))
          .map((item) => {
            const def = getPlacementDef(item.sku);
            const src = item.sku ? furnitureImageSrc(item.sku, item.facing ?? def.defaultFacing) : null;
            const isSelected = selectedId === item.id;
            const style = furnitureWrapperStyle({
              x: item.x,
              y: item.y,
              scale: item.scale,
              rotation: item.rotation + wallTiltFor(def.placementType, item.x),
              flipX: item.flipX,
              depth: depthOf(item.y, item.zIndex),
              baseHeightFrac: def.baseHeightFrac,
            });
            return (
              <button
                key={item.id}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setSelectedId(item.id);
                  setDraggingId(item.id);
                }}
                style={{
                  ...style,
                  outline: isSelected ? "2px solid var(--color-tab-active)" : "none",
                  outlineOffset: 3,
                  borderRadius: 8,
                }}
              >
                {src ? (
                  <Image src={src} alt="" width={400} height={400} unoptimized style={{ height: "100%", width: "auto", objectFit: "contain" }} />
                ) : (
                  <div className="flex aspect-square h-full items-center justify-center rounded-xl bg-white/90 text-[9px] font-bold text-[var(--color-navy)] shadow">
                    {item.name.slice(0, 2)}
                  </div>
                )}
              </button>
            );
          })}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-extrabold text-[var(--color-navy)]">벽지</p>
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
          {WALLPAPER_SWATCHES.map((s) => (
            <button
              key={s.key}
              onClick={() => pickDecor("wallpaper", s.key)}
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 ${
                wallpaper === s.key ? "border-[var(--color-tab-active)]" : "border-white"
              }`}
              style={{ backgroundImage: `url(${s.src})`, backgroundSize: "cover" }}
              aria-label={s.key}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-extrabold text-[var(--color-navy)]">바닥재</p>
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
          {FLOOR_SWATCHES.map((s) => (
            <button
              key={s.key}
              onClick={() => pickDecor("floor", s.key)}
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 ${
                floor === s.key ? "border-[var(--color-tab-active)]" : "border-white"
              }`}
              style={{ backgroundImage: `url(${s.src})`, backgroundSize: "cover" }}
              aria-label={s.key}
            />
          ))}
        </div>
      </div>

      {selected && selectedDef && (
        <Card className="sticky bottom-2 z-20 flex flex-col gap-2 !p-3 shadow-[0_10px_28px_rgba(36,54,90,0.18)]">
          <p className="text-[13px] font-bold text-[var(--color-navy)]">{selected.name}</p>
          <div className="flex flex-wrap gap-1.5">
            <IconBtn label="회전" onClick={() => updateSelected({ rotation: selected.rotation - 15 })}>
              <RotateLeftIcon />
            </IconBtn>
            <IconBtn label="회전" onClick={() => updateSelected({ rotation: selected.rotation + 15 })}>
              <RotateRightIcon />
            </IconBtn>
            <IconBtn
              label="반전"
              disabled={!selectedDef.mirrorSafe}
              onClick={() => updateSelected({ flipX: !selected.flipX })}
            >
              <FlipIcon />
            </IconBtn>
            <IconBtn
              label="방향"
              disabled={!selected.sku || availableFacings(selected.sku).length < 2}
              onClick={cycleSelectedFacing}
            >
              <FacingIcon />
            </IconBtn>
            <IconBtn
              label="작게"
              onClick={() => updateSelected({ scale: Math.max(selectedDef.minScale, +(selected.scale - 0.1).toFixed(2)) })}
            >
              <ShrinkIcon />
            </IconBtn>
            <IconBtn
              label="크게"
              onClick={() => updateSelected({ scale: Math.min(selectedDef.maxScale, +(selected.scale + 0.1).toFixed(2)) })}
            >
              <GrowIcon />
            </IconBtn>
            <IconBtn label="앞으로" onClick={bringForward}>
              <LayerForwardIcon />
            </IconBtn>
            <IconBtn label="뒤로" onClick={sendBackward}>
              <LayerBackIcon />
            </IconBtn>
            <IconBtn label="회수" onClick={removeSelected} danger>
              <PickupIcon />
            </IconBtn>
          </div>
        </Card>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[14px] font-extrabold text-[var(--color-navy)]">가방에서 배치하기</p>
          <Link href="/stores/furniture" className="text-[12px] font-bold text-[var(--color-tab-active)]">
            가구상점 가기 ›
          </Link>
        </div>
        {unplaced.length === 0 ? (
          <p className="text-[13px] text-[var(--color-navy-soft)]">배치할 수 있는 아이템이 모두 방에 놓여 있어요.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {unplaced.map((item) => (
              <button key={item.inventoryItemId} onClick={() => addFromBag(item)}>
                <Card className="flex flex-col items-center gap-1 !p-2.5 text-center text-[12px] font-bold text-[var(--color-navy)]">
                  {itemIconSrc(item.sku) && (
                    <Image src={itemIconSrc(item.sku)!} alt="" width={36} height={36} unoptimized style={{ width: 36, height: 36, objectFit: "contain" }} />
                  )}
                  {item.name}
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex flex-col items-center gap-0.5 rounded-2xl px-2.5 py-1.5 text-[10px] font-bold disabled:opacity-30 ${
        danger ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]" : "bg-[var(--color-sky)] text-[var(--color-navy)]"
      }`}
    >
      {children}
      {label}
    </button>
  );
}
