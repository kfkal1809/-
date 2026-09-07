import Image from "next/image";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import { HAIR_STYLE_INDEX } from "@/lib/domain/characterFullBody";
import {
  HAENYEO_MASTER_CANVAS_W,
  HAENYEO_MASTER_CANVAS_H,
  haenyeoMasterBodySrc,
  haenyeoMasterSkinMaskSrc,
  haenyeoMasterOutfitSrc,
  haenyeoMasterHairFrontSrc,
  haenyeoMasterHairFrontMaskSrc,
  haenyeoResolveHairIdx,
} from "@/lib/domain/characterFullBody";

// 해녀 전용 렌더러 — scripts/asset-tools/build_haenyeo_master_canvas.py로 몸/얼굴/헤어/
// 의상을 전부 같은 441x906 MASTER 캔버스에 미리 구워뒀기 때문에, 여기서는 그 결과물을
// 순서대로 겹치기만 한다. topFrac/widthFrac/scaleX/scaleY 같은 레이어별 런타임 보정은
// 일절 쓰지 않는다(전부 position:absolute, inset:0, width/height:100% — 컨테이너
// 전체에만 uniform scale 적용). 옷을 바꾸든 헤어를 바꾸든 몸/얼굴 크기가 흔들리지 않는다.
//
// 레이어 순서: MASTER 몸+민머리 얼굴(헤어 착용 시 두상 외곽선 정리된 변형) → 의상 → 앞머리
// → (모자 등, 추후). 2026-09-07 기준 선택 가능한 8종은 전부 얼굴에 구멍이 뚫린 정면 그림이라
// 뒷머리 레이어가 필요 없다(19/20 뒷모습 전용 자산은 선택 목록에서 뺐다).
const LAYER_STYLE: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

export function HaenyeoMasterSprite({
  appearance: a,
  size = 140,
  className,
  flip,
  hairAssetKeyOverride,
  showDebugLabel,
  hideOutfit,
  hideHair,
}: {
  appearance: CharacterAppearance;
  size?: number;
  className?: string;
  flip?: boolean;
  hairAssetKeyOverride?: string;
  showDebugLabel?: boolean;
  // QA 전용 — A/B/C/D 단계별 비교 캡처를 뜨기 위한 스위치. 실제 게임 화면 호출부는 안 쓴다.
  hideOutfit?: boolean;
  hideHair?: boolean;
}) {
  // 저장된 hairStyle이 가리키는 번호가 선택 목록에서 빠진(원화 결함/미제공) 것이면 깨진
  // 헤어를 그대로 보여주지 않고 정상 기본 헤어(03)로 대체해서 보여준다 — appearance 값
  // 자체는 바꾸지 않는다(haenyeoResolveHairIdx 참고).
  const rawHairIdx = hideHair ? null : (hairAssetKeyOverride ?? HAIR_STYLE_INDEX.haenyeo[a.hairStyle] ?? null);
  const hairIdx = haenyeoResolveHairIdx(rawHairIdx);
  const outfitAssetKey = a.outfitAssetKey ?? "haenyeo_outfit_02";
  // 원본이 없는 번호면 null — 다른 옷으로 대체하지 않고 이 캐릭터는 의상 레이어 없이(MASTER
  // 몸 자체의 기본 이너웨어만) 그린다. 정확히 어떤 파일이 없는지는 haenyeoMasterOutfitSrc가
  // 개발 로그에 남긴다.
  const outfitSrc = hideOutfit ? null : haenyeoMasterOutfitSrc(outfitAssetKey);

  const width = Math.round((size * HAENYEO_MASTER_CANVAS_W) / HAENYEO_MASTER_CANVAS_H);
  const height = size;

  return (
    <div
      className={className}
      style={{ position: "relative", width, height, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <Image
        src={haenyeoMasterBodySrc(hairIdx)}
        alt=""
        aria-hidden
        width={HAENYEO_MASTER_CANVAS_W}
        height={HAENYEO_MASTER_CANVAS_H}
        unoptimized
        style={LAYER_STYLE}
      />
      {/* 피부톤 — 명암(하이라이트/그림자)은 그대로 두고 색상만 바꾸는 mix-blend-mode:color.
          기본값에서는 원본 그림 색이 그대로 나온다(multiply와 달리 이중 틴트 없음). */}
      <div
        aria-hidden
        style={{
          ...LAYER_STYLE,
          backgroundColor: a.skinTone,
          WebkitMaskImage: `url(${haenyeoMasterSkinMaskSrc()})`,
          maskImage: `url(${haenyeoMasterSkinMaskSrc()})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          mixBlendMode: "color",
        }}
      />

      {outfitSrc && (
        <Image
          src={outfitSrc}
          alt=""
          aria-hidden
          width={HAENYEO_MASTER_CANVAS_W}
          height={HAENYEO_MASTER_CANVAS_H}
          unoptimized
          style={LAYER_STYLE}
        />
      )}

      {hairIdx && (
        <>
          <Image
            src={haenyeoMasterHairFrontSrc(hairIdx)}
            alt=""
            aria-hidden
            width={HAENYEO_MASTER_CANVAS_W}
            height={HAENYEO_MASTER_CANVAS_H}
            unoptimized
            style={LAYER_STYLE}
          />
          <div
            aria-hidden
            style={{
              ...LAYER_STYLE,
              backgroundColor: a.hairColor,
              WebkitMaskImage: `url(${haenyeoMasterHairFrontMaskSrc(hairIdx)})`,
              maskImage: `url(${haenyeoMasterHairFrontMaskSrc(hairIdx)})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              mixBlendMode: "color",
            }}
          />
        </>
      )}

      {showDebugLabel && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            fontSize: 9,
            fontFamily: "monospace",
            background: "rgba(255,255,255,0.85)",
            color: "#123",
            padding: "1px 2px",
            lineHeight: 1.3,
          }}
        >
          outfit={outfitAssetKey}
          {!outfitSrc && (hideOutfit ? " (QA로 숨김)" : " (원본 누락)")}
          <br />
          hair={hairIdx ?? "none"}
          {rawHairIdx && rawHairIdx !== hairIdx && ` (요청 ${rawHairIdx} → 대체)`}
          <br />
          {HAENYEO_MASTER_CANVAS_W}x{HAENYEO_MASTER_CANVAS_H}
        </div>
      )}
    </div>
  );
}
