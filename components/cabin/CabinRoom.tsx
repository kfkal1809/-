import Image from "next/image";
import Link from "next/link";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { GameIcon } from "@/components/icons/GameIcon";
import { RoomBackground } from "@/components/cabin/RoomBackground";
import type { CabinData } from "@/lib/game/cabinData";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";
import { itemIconSrc } from "@/lib/domain/itemIcons";

export function CabinRoom({ data }: { data: CabinData }) {
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

        {data.placedItems.map((item) => (
          <div
            key={item.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%`, transform: `translate(-50%, -50%) rotate(${item.rotation}deg)` }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/85 text-[9px] font-bold text-[var(--color-navy)] shadow">
              {itemIconSrc(item.sku) ? (
                <Image src={itemIconSrc(item.sku)!} alt="" width={28} height={28} unoptimized style={{ width: "88%", height: "88%", objectFit: "contain" }} />
              ) : (
                item.name.slice(0, 2)
              )}
            </div>
          </div>
        ))}

        <div className="absolute bottom-[6%] left-1/2 flex -translate-x-1/2 gap-3">
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
