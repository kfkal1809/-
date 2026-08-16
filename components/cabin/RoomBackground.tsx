import Image from "next/image";
import { wallpaperSrc, floorSrc, ROOM_CLIP } from "@/lib/domain/cabinDecor";

// 기본 선실 일러스트 위에 선택한 벽지/바닥재를 mix-blend-mode:multiply로 겹쳐 물들인다.
// 벽/바닥 영역 좌표는 원화 위에서 눈대중으로 딴 것이라 약간의 오차가 있을 수 있음(ROOM_CLIP 참고).
export function RoomBackground({ wallpaper, floor }: { wallpaper?: string | null; floor?: string | null }) {
  const wallpaperImg = wallpaperSrc(wallpaper);
  const floorImg = floorSrc(floor);

  return (
    <>
      <Image src="/images/cabin/room-base.png" alt="" fill unoptimized priority className="pointer-events-none object-cover" />
      {wallpaperImg && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${wallpaperImg})`,
              backgroundSize: "160px 160px",
              backgroundRepeat: "repeat",
              clipPath: ROOM_CLIP.leftWall,
              mixBlendMode: "multiply",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${wallpaperImg})`,
              backgroundSize: "160px 160px",
              backgroundRepeat: "repeat",
              clipPath: ROOM_CLIP.rightWall,
              mixBlendMode: "multiply",
            }}
          />
        </>
      )}
      {floorImg && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${floorImg})`,
            backgroundSize: "160px 160px",
            backgroundRepeat: "repeat",
            clipPath: ROOM_CLIP.floor,
            mixBlendMode: "multiply",
          }}
        />
      )}
    </>
  );
}
