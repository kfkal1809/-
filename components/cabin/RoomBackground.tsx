import Image from "next/image";
import { wallpaperSrc, floorSrc, ROOM_CLIP } from "@/lib/domain/cabinDecor";

// 기본 선실 일러스트 위에 선택한 벽지/바닥재를 mix-blend-mode:multiply로 겹쳐 물들인다.
// 바닥 영역 좌표는 원화 위에서 눈대중으로 딴 것이라 약간의 오차가 있을 수 있음(ROOM_CLIP 참고).
// 벽은 예전에 polygon clipPath만 썼는데, 그 폴리곤이 창문/커튼/문/환기구까지 통째로 덮는
// 영역이라 벽지를 바꾸면 그 위의 창문/커튼/문 색까지 같이 물들어버리는 버그가 있었다 —
// 원화에서 창문·커튼·문·환기구 위치를 실측해 뚫어낸 PNG 마스크(mask-image)로 교체해서,
// 진짜 "빈 벽 패널" 영역에만 벽지가 입혀지도록 고쳤다.
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
              WebkitMaskImage: "url(/images/cabin/masks/left_wall_mask.png)",
              maskImage: "url(/images/cabin/masks/left_wall_mask.png)",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
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
              WebkitMaskImage: "url(/images/cabin/masks/right_wall_mask.png)",
              maskImage: "url(/images/cabin/masks/right_wall_mask.png)",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
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
