"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import { RoomBackground } from "@/components/cabin/RoomBackground";
import { WALLPAPER_SWATCHES, FLOOR_SWATCHES } from "@/lib/domain/cabinDecor";
import { playSfx } from "@/lib/audio/audioManager";
import type { PlacedFurniture, UnplacedFurniture } from "@/lib/game/cabinEditData";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [wallpaper, setWallpaper] = useState(initialWallpaper);
  const [floor, setFloor] = useState(initialFloor);
  const [decorSaving, setDecorSaving] = useState(false);

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
    const rect = roomRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setPlaced((prev) => prev.map((p) => (p.id === draggingId ? { ...p, x, y } : p)));
  }

  function addFromBag(item: UnplacedFurniture) {
    const maxZ = placed.reduce((max, p) => Math.max(max, p.zIndex), 0);
    const newItem: PlacedFurniture = {
      id: `new:${tempIdCounter++}`,
      inventoryItemId: item.inventoryItemId,
      sku: item.sku,
      name: item.name,
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      flipX: false,
      zIndex: maxZ + 1,
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
          })),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setMessage("저장했어요!");
      router.refresh();
    } catch {
      setMessage("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  const selected = placed.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">방꾸미기</h1>
        <Button tone="coral" onClick={handleSave} disabled={saving || !spaceId} className="!px-4 !py-2 text-[14px]">
          {saving ? "저장 중..." : "저장"}
        </Button>
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
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((item) => (
            <button
              key={item.id}
              onPointerDown={(e) => {
                e.preventDefault();
                setSelectedId(item.id);
                setDraggingId(item.id);
              }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{
                left: `${item.x * 100}%`,
                top: `${item.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scaleX(${item.flipX ? -1 : 1}) scale(${item.scale})`,
              }}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-[9px] font-bold shadow ${
                  selectedId === item.id ? "bg-[var(--color-sky-new)] text-white" : "bg-white/90 text-[var(--color-navy)]"
                }`}
              >
                {itemIconSrc(item.sku) ? (
                  <Image src={itemIconSrc(item.sku)!} alt="" width={28} height={28} unoptimized style={{ width: "88%", height: "88%", objectFit: "contain" }} />
                ) : (
                  item.name.slice(0, 2)
                )}
              </div>
            </button>
          ))}
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

      {selected && (
        <Card className="flex flex-wrap items-center justify-between gap-2 !p-3">
          <p className="text-[13px] font-bold text-[var(--color-navy)]">{selected.name}</p>
          <div className="flex flex-wrap gap-1.5">
            <IconBtn onClick={() => updateSelected({ rotation: selected.rotation - 15 })}>↺</IconBtn>
            <IconBtn onClick={() => updateSelected({ rotation: selected.rotation + 15 })}>↻</IconBtn>
            <IconBtn onClick={() => updateSelected({ flipX: !selected.flipX })}>⇋</IconBtn>
            <IconBtn onClick={() => updateSelected({ scale: Math.max(0.5, selected.scale - 0.1) })}>−</IconBtn>
            <IconBtn onClick={() => updateSelected({ scale: Math.min(1.8, selected.scale + 0.1) })}>+</IconBtn>
            <IconBtn onClick={bringForward}>앞으로</IconBtn>
            <IconBtn onClick={sendBackward}>뒤로</IconBtn>
            <IconBtn onClick={removeSelected} danger>
              가방으로
            </IconBtn>
          </div>
        </Card>
      )}

      <div>
        <p className="mb-2 text-[14px] font-extrabold text-[var(--color-navy)]">가방에서 배치하기</p>
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

function IconBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1.5 text-[12px] font-bold ${
        danger ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]" : "bg-[var(--color-sky)] text-[var(--color-navy)]"
      }`}
    >
      {children}
    </button>
  );
}
