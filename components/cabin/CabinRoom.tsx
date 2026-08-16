import Image from "next/image";
import Link from "next/link";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { GameIcon } from "@/components/icons/GameIcon";
import { RoomBackground } from "@/components/cabin/RoomBackground";
import type { CabinData } from "@/lib/game/cabinData";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import { getPlacementDef, furnitureWrapperStyle, depthOf } from "@/lib/domain/cabinPlacement";

// 캐릭터 열을 방 바닥의 이 y위치에 서 있는 것으로 취급해 가구와 같은 depth 계산식을 쓴다
// (예: 등대 액자처럼 y가 작은 벽 장식은 항상 캐릭터 뒤, 러그처럼 y가 큰 바닥 가구는 앞).
const CHARACTER_Y = 0.86;

export function CabinRoom({ data }: { data: CabinData }) {
  const characterDepth = depthOf(CHARACTER_Y, 0);

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">{data.cabinName}</h1>
        {data.isOwner && (
          <Link href="/cabin/edit" className="rounded-full bg-[var(--color-navy)] px-4 py-2 text-[13px] font-bold text-white">
            방꾸미기
          </Link>
        )}
      </div>

      <div className="relative aspect-[1473/909] w-full overflow-hidden rounded-[28px] border-2 border-white shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
        <RoomBackground wallpaper={data.wallpaper} floor={data.floor} />

        {data.placedItems.map((item) => {
          const def = getPlacementDef(item.sku);
          const src = itemIconSrc(item.sku);
          return (
            <div
              key={item.id}
              style={furnitureWrapperStyle({
                x: item.x,
                y: item.y,
                scale: item.scale,
                rotation: item.rotation,
                flipX: item.flipX,
                depth: depthOf(item.y, item.zIndex),
                baseHeightFrac: def.baseHeightFrac,
              })}
            >
              {src ? (
                <Image
                  src={src}
                  alt=""
                  width={400}
                  height={400}
                  unoptimized
                  style={{ height: "100%", width: "auto", objectFit: "contain" }}
                />
              ) : (
                <div className="flex aspect-square h-full items-center justify-center rounded-xl bg-white/85 text-[9px] font-bold text-[var(--color-navy)] shadow">
                  {item.name.slice(0, 2)}
                </div>
              )}
            </div>
          );
        })}

        <div
          className="absolute left-1/2 flex gap-3"
          style={{ top: `${CHARACTER_Y * 100}%`, transform: "translate(-50%, -100%)", zIndex: Math.round(characterDepth * 10) }}
        >
          {data.characters.map((c) =>
            data.isOwner ? (
              <Link key={c.id} href={`/character/${c.id}/customize`} className="flex flex-col items-center">
                <CharacterSprite appearance={c.appearance} kind={c.kind} size={70} />
                <p className="rounded-full bg-white/85 px-2 text-[11px] font-bold text-[var(--color-navy)]">{c.nickname}</p>
              </Link>
            ) : (
              <Link key={c.id} href={`/boarding-pass/${c.id}`} className="flex flex-col items-center">
                <CharacterSprite appearance={c.appearance} kind={c.kind} size={70} />
                <p className="rounded-full bg-white/85 px-2 text-[11px] font-bold text-[var(--color-navy)]">{c.nickname}</p>
              </Link>
            )
          )}
        </div>
      </div>

      <div className="rounded-[24px] border-2 border-white bg-white p-4 shadow-[0_6px_20px_rgba(36,54,90,0.08)]">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-extrabold text-[var(--color-navy)]">방명록</p>
          {data.householdId && (
            <Link href={`/cabin/${data.householdId}/guestbook`} className="text-[12px] font-bold text-[var(--color-tab-active)]">
              전체보기 ›
            </Link>
          )}
        </div>

        {data.guestbook.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 text-[13px] text-[var(--color-navy-soft)]">
            <GameIcon name="book" size={22} />
            {EMPTY_STATE_COPY.guestbook}
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {data.guestbook.slice(0, 3).map((g) => (
              <li key={g.id} className="text-[13px]">
                <span className="font-bold text-[var(--color-navy)]">{g.authorNickname}</span>{" "}
                <span className="text-[var(--color-navy-soft)]">{g.body}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
