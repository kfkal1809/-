import Image from "next/image";
import { memo } from "react";
import type { CharacterAppearance, HairStyle, OutfitStyle } from "@/lib/domain/characterPresets";
import type { ChildGender, ChildStage, CharacterKind } from "@/lib/domain/types";
import {
  PORTRAIT_SIZE,
  characterPortraitKeyFor,
  characterPortraitSrc,
  characterOutfitMaskSrc,
  characterSkinMaskSrc,
  characterHairMaskSrc,
} from "@/lib/domain/characterPortrait";
import {
  OUTFIT_CANVAS_W,
  OUTFIT_CANVAS_H,
  NECK_Y,
  HEAD_WIDTH,
  HEAD_OVERLAP,
  headMarginTopFor,
  HEAD_SIZE,
  HEAD_BALD_SIZE,
  heightScaleFor,
  HAT_SIZE,
  HAT_PLACEMENT,
  HAND_SIZE,
  HAND_PLACEMENT,
  HAND_ACCESSORY_ANCHOR,
  NECK_SIZE,
  NECK_PLACEMENT,
  NECK_ACCESSORY_ANCHOR,
  HAIR_ASSET_PLACEMENT,
  headSrc,
  outfitFullSrc,
  hatSrc,
  handAccessorySrc,
  neckAccessorySrc,
  baldHeadSrc,
  baldSkinMaskSrc,
  hairOverlaySrc,
  hairOverlayMaskSrc,
  resolveHairAssetKey,
} from "@/lib/domain/characterFullBody";

interface CharacterSpriteProps {
  appearance: CharacterAppearance;
  size?: number;
  className?: string;
  flip?: boolean;
  // kind가 주어지면 사용자가 그려준 실제 일러스트를 렌더링한다(없으면 기존 벡터로 폴백).
  // size는 세로 높이 기준(실사 일러스트는 벡터보다 훨씬 슬림해서 가로 기준이면 레이아웃이 깨짐).
  kind?: CharacterKind;
  childGender?: ChildGender | null;
  childStage?: ChildStage | null;
}

const NAVY = "#2a3552";

function HairBack({ style, color, cx, cy, r }: { style: HairStyle; color: string; cx: number; cy: number; r: number }) {
  switch (style) {
    case "wave":
      return (
        <>
          <path
            d={`M ${cx - r + 4} ${cy - 8} C ${cx - r - 14} ${cy + 40}, ${cx - r - 6} ${cy + 78}, ${cx - r + 18} ${cy + 88} C ${cx - r + 30} ${cy + 70}, ${cx - r + 16} ${cy + 30}, ${cx - r + 20} ${cy - 4} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="3"
          />
          <path
            d={`M ${cx + r - 4} ${cy - 8} C ${cx + r + 14} ${cy + 40}, ${cx + r + 6} ${cy + 78}, ${cx + r - 18} ${cy + 88} C ${cx + r - 30} ${cy + 70}, ${cx + r - 16} ${cy + 30}, ${cx + r - 20} ${cy - 4} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="3"
          />
        </>
      );
    case "pony":
      return (
        <path
          d={`M ${cx + r - 10} ${cy - 20} C ${cx + r + 30} ${cy + 6}, ${cx + r + 22} ${cy + 60}, ${cx + r - 6} ${cy + 78} C ${cx + r + 6} ${cy + 40}, ${cx + r - 2} ${cy + 6}, ${cx + r - 18} ${cy - 12} Z`}
          fill={color}
          stroke={NAVY}
          strokeWidth="3"
        />
      );
    case "twin":
      return (
        <>
          <ellipse cx={cx - r + 6} cy={cy + 14} rx={16} ry={22} fill={color} stroke={NAVY} strokeWidth="3" />
          <ellipse cx={cx + r - 6} cy={cy + 14} rx={16} ry={22} fill={color} stroke={NAVY} strokeWidth="3" />
          <circle cx={cx - r + 6} cy={cy - 4} r={5} fill="#ff9a8b" stroke={NAVY} strokeWidth="2" />
          <circle cx={cx + r - 6} cy={cy - 4} r={5} fill="#ff9a8b" stroke={NAVY} strokeWidth="2" />
        </>
      );
    case "bun":
      return <circle cx={cx} cy={cy - r - 6} r={16} fill={color} stroke={NAVY} strokeWidth="3" />;
    case "bob":
      return (
        <path
          d={`M ${cx - r} ${cy - 6} C ${cx - r - 6} ${cy + 30}, ${cx - r + 2} ${cy + 46}, ${cx - r + 14} ${cy + 50}
              L ${cx + r - 14} ${cy + 50} C ${cx + r - 2} ${cy + 46}, ${cx + r + 6} ${cy + 30}, ${cx + r} ${cy - 6} Z`}
          fill={color}
          stroke={NAVY}
          strokeWidth="3"
        />
      );
    default:
      return null;
  }
}

function HairFront({ style, color, cx, cy, r }: { style: HairStyle; color: string; cx: number; cy: number; r: number }) {
  const bangs = (() => {
    switch (style) {
      case "buzz":
        return `M ${cx - r + 6} ${cy - r + 18} A ${r - 4} ${r - 4} 0 0 1 ${cx + r - 6} ${cy - r + 18} L ${cx + r - 10} ${cy - r + 30} A ${r - 14} ${r - 14} 0 0 0 ${cx - r + 10} ${cy - r + 30} Z`;
      case "sideswept":
        return `M ${cx - r + 4} ${cy - r + 30} C ${cx - r + 20} ${cy - r + 4}, ${cx + r - 30} ${cy - r + 2}, ${cx + r - 6} ${cy - r + 24} C ${cx + r - 20} ${cy - 8}, ${cx - 4} ${cy - 6}, ${cx - r + 4} ${cy - r + 30} Z`;
      default:
        return `M ${cx - r + 2} ${cy - r + 26} C ${cx - r + 10} ${cy - r + 2}, ${cx + r - 10} ${cy - r + 2}, ${cx + r - 2} ${cy - r + 26}
                C ${cx + r - 14} ${cy - r + 12}, ${cx - r + 14} ${cy - r + 12}, ${cx - r + 2} ${cy - r + 26} Z`;
    }
  })();
  return <path d={bangs} fill={color} stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />;
}

function Outfit({
  style,
  color,
  accent,
  cx,
  torsoTop,
  torsoW,
  torsoH,
}: {
  style: OutfitStyle;
  color: string;
  accent: string;
  cx: number;
  torsoTop: number;
  torsoW: number;
  torsoH: number;
}) {
  const left = cx - torsoW / 2;
  const bibTop = torsoTop + torsoH * 0.28;
  switch (style) {
    case "haenyeo_overalls":
    case "child_overalls":
      return (
        <>
          {/* 흰 티 */}
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={accent} stroke={NAVY} strokeWidth="3" />
          {/* 청멜빵 바디 */}
          <path
            d={`M ${left + 8} ${bibTop} h ${torsoW - 16} v ${torsoH - (bibTop - torsoTop) - 6} a 10 10 0 0 1 -10 10 h ${-(torsoW - 36)} a 10 10 0 0 1 -10 -10 Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="3"
          />
          {/* 멜빵끈 */}
          <path d={`M ${cx - torsoW * 0.28} ${torsoTop + 4} L ${cx - torsoW * 0.14} ${bibTop}`} stroke={color} strokeWidth="9" strokeLinecap="round" />
          <path d={`M ${cx + torsoW * 0.28} ${torsoTop + 4} L ${cx + torsoW * 0.14} ${bibTop}`} stroke={color} strokeWidth="9" strokeLinecap="round" />
          <path d={`M ${cx - torsoW * 0.28} ${torsoTop + 4} L ${cx - torsoW * 0.14} ${bibTop}`} stroke={NAVY} strokeWidth="1" strokeLinecap="round" opacity={0.3} />
          {/* 포켓 */}
          <rect x={cx - 9} y={bibTop + 12} width={18} height={14} rx={3} fill={accent} stroke={NAVY} strokeWidth="2" opacity={0.9} />
        </>
      );
    case "haenam_deck_uniform":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 12} ${torsoTop + 2} L ${cx} ${torsoTop + 22} L ${cx + 12} ${torsoTop + 2}`} fill="none" stroke={accent} strokeWidth="7" strokeLinejoin="round" />
          <rect x={cx - 5} y={torsoTop + 24} width={10} height={torsoH - 30} rx={3} fill={accent} />
          <circle cx={cx} cy={torsoTop + 32} r={2.4} fill={color} />
          <circle cx={cx} cy={torsoTop + 44} r={2.4} fill={color} />
          <rect x={left + 2} y={torsoTop + 4} width={16} height={6} rx={2} fill={accent} opacity={0.85} />
          <rect x={left + torsoW - 18} y={torsoTop + 4} width={16} height={6} rx={2} fill={accent} opacity={0.85} />
        </>
      );
    case "haenam_engine_overalls":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />
          <line x1={cx} y1={torsoTop + 6} x2={cx} y2={torsoTop + torsoH - 8} stroke={accent} strokeWidth="3" strokeDasharray="3 3" />
          <rect x={cx + 6} y={torsoTop + 14} width={14} height={11} rx={2} fill={accent} opacity={0.25} stroke={NAVY} strokeWidth="1.5" />
        </>
      );
    case "chef":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 20} ${torsoTop + 8} h 40 v ${torsoH - 10} h -40 Z`} fill={accent} opacity={0.9} stroke={NAVY} strokeWidth="2.5" />
        </>
      );
    case "cardigan":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={accent} stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 6} ${torsoTop} v ${torsoH}`} stroke={color} strokeWidth="3" opacity={0.4} />
          <path
            d={`M ${left - 2} ${torsoTop + 6} q ${torsoW * 0.18} ${torsoH * 0.5} 4 ${torsoH - 4} L ${cx - 4} ${torsoTop + torsoH} L ${cx - 4} ${torsoTop + 6} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="2.5"
          />
          <path
            d={`M ${left + torsoW + 2} ${torsoTop + 6} q ${-torsoW * 0.18} ${torsoH * 0.5} -4 ${torsoH - 4} L ${cx + 4} ${torsoTop + torsoH} L ${cx + 4} ${torsoTop + 6} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="2.5"
          />
        </>
      );
    case "tank":
      return (
        <>
          <rect x={left + 10} y={torsoTop} width={torsoW - 20} height={torsoH} rx={torsoW / 2.6} fill={color} stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 14} ${torsoTop + 4} L ${cx} ${torsoTop + 16} L ${cx + 14} ${torsoTop + 4}`} fill="none" stroke={accent} strokeWidth="5" strokeLinejoin="round" />
        </>
      );
    case "dress":
      return (
        <>
          <path
            d={`M ${left + 6} ${torsoTop} q ${torsoW / 2 - 6} -8 ${torsoW - 12} 0
                L ${left + torsoW + 10} ${torsoTop + torsoH + 16}
                Q ${cx} ${torsoTop + torsoH + 30} ${left - 10} ${torsoTop + torsoH + 16} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d={`M ${cx - 12} ${torsoTop + 2} L ${cx} ${torsoTop + 14} L ${cx + 12} ${torsoTop + 2}`} fill="none" stroke={accent} strokeWidth="5" strokeLinejoin="round" />
        </>
      );
    case "sweatshirt":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.2} fill={color} stroke={NAVY} strokeWidth="3" />
          <ellipse cx={cx} cy={torsoTop + 4} rx={14} ry={6} fill={accent} opacity={0.9} />
          <path d={`M ${left + 4} ${torsoTop + torsoH - 10} q 10 10 20 0`} fill="none" stroke={accent} strokeWidth="3" opacity={0.8} />
          <path d={`M ${left + torsoW - 24} ${torsoTop + torsoH - 10} q 10 10 20 0`} fill="none" stroke={accent} strokeWidth="3" opacity={0.8} />
        </>
      );
    case "pajama":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />
          {[0.25, 0.5, 0.75].map((fx) =>
            [0.35, 0.7].map((fy) => (
              <circle key={`${fx}-${fy}`} cx={left + torsoW * fx} cy={torsoTop + torsoH * fy} r={2.6} fill={accent} opacity={0.85} />
            ))
          )}
          <path d={`M ${cx - 14} ${torsoTop + 3} L ${cx} ${torsoTop + 13} L ${cx + 14} ${torsoTop + 3}`} fill="none" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
        </>
      );
    case "hoodie":
      return (
        <>
          <path d={`M ${cx - 20} ${torsoTop - 10} q 20 -14 40 0 q 4 10 -4 16 q -16 -8 -32 0 q -8 -6 -4 -16 Z`} fill={color} stroke={NAVY} strokeWidth="2.5" />
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.3} fill={color} stroke={NAVY} strokeWidth="3" />
          <circle cx={cx - 5} cy={torsoTop + 10} r={1.8} fill={accent} />
          <circle cx={cx + 5} cy={torsoTop + 10} r={1.8} fill={accent} />
          <path d={`M ${cx - 5} ${torsoTop + 10} q 5 8 10 0`} fill="none" stroke={accent} strokeWidth="1.6" />
        </>
      );
    default:
      return <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />;
  }
}

function Hat({ style, cx, top, accent, color }: { style: string; cx: number; top: number; accent: string; color: string }) {
  switch (style) {
    case "captain":
      return (
        <g>
          <ellipse cx={cx} cy={top + 16} rx={40} ry={11} fill="#f4f8ff" stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 30} ${top + 12} a 30 22 0 0 1 60 0 Z`} fill="#f4f8ff" stroke={NAVY} strokeWidth="3" />
          <rect x={cx - 30} y={top - 2} width={60} height={9} fill={color} stroke={NAVY} strokeWidth="2" />
          <circle cx={cx} cy={top + 3} r={4.5} fill="#f4c978" stroke={NAVY} strokeWidth="1.5" />
        </g>
      );
    case "chef":
      return (
        <g>
          <rect x={cx - 22} y={top + 6} width={44} height={16} rx={4} fill="#ffffff" stroke={NAVY} strokeWidth="3" />
          <path
            d={`M ${cx - 22} ${top + 8} q -6 -26 10 -30 q 4 -10 14 -6 q 6 -10 16 0 q 14 -2 12 20 q 8 4 4 16 Z`}
            fill="#ffffff"
            stroke={NAVY}
            strokeWidth="3"
          />
        </g>
      );
    case "hardhat":
      return <path d={`M ${cx - 26} ${top + 14} a 26 18 0 0 1 52 0 Z`} fill={accent} stroke={NAVY} strokeWidth="3" />;
    default:
      return null;
  }
}

function Accessory({ style, cx, y }: { style: string; cx: number; y: number }) {
  if (style === "wrench") {
    return (
      <g transform={`translate(${cx + 46} ${y}) rotate(28)`}>
        <rect x={-4} y={-22} width={8} height={40} rx={3} fill="#c9ccd4" stroke={NAVY} strokeWidth="2" />
        <circle cx={0} cy={-22} r={8} fill="none" stroke="#c9ccd4" strokeWidth="5" />
      </g>
    );
  }
  if (style === "tablet") {
    return (
      <g transform={`translate(${cx + 40} ${y + 6}) rotate(-8)`}>
        <rect x={-10} y={-14} width={20} height={26} rx={3} fill="#f4f8ff" stroke={NAVY} strokeWidth="2.5" />
        <rect x={-6} y={-9} width={12} height={16} rx={1} fill="#cfe6ff" />
      </g>
    );
  }
  return null;
}

// 화면마다 여러 개(갑판 광장 접속자 목록, 선실 등) 그려지는 데다 내부적으로 최대 7겹의
// <Image>와 SVG 경로를 계산하는 무거운 컴포넌트라, memo 없이는 이 컴포넌트와 무관한 부모의
// 리렌더(예: 채팅 입력창 타이핑으로 인한 state 변경)만으로도 매번 다시 계산됐다 — 타이핑이
// 버벅이던 원인 중 하나. appearance/kind 등 props가 실제로 안 바뀌면 다시 그리지 않는다.
export const CharacterSprite = memo(function CharacterSprite({ appearance: a, size = 140, className, flip, kind, childGender, childStage }: CharacterSpriteProps) {
  // 플레이어 캐릭터(kind 있음)는 MASTER 기본 체형(base/<kind>.png) → 헤어 → 의상 →
  // 모자/액세서리 순으로 항상 outfitAssetKey 경로 하나로만 그린다. fullPortraitKey(완성 전신
  // PNG를 통째로 얹어 MASTER 체형을 우회하던 옛 경로)는 의상마다 머리 크기·키·다리 길이가
  // 달라지는 원인이었다(같은 dress_full이 사실 base/<kind>.png + 의상 합성이라 몸은 같은데,
  // 이 경로만 다른 스케일 공식을 썼다) — scripts/asset-tools/convert_dress_full_to_outfit.py로
  // 모든 dress_full을 outfitAssetKey 규격으로 재변환해 이 경로 자체를 없앴다.
  if (kind && a.outfitAssetKey) {
    // 목 아래(의상+체형)를 하나의 정규화된 전신 스프라이트로, 목 위(얼굴+헤어)는 모든 의상에
    // 대해 같은 위치에 고정 배치 — 개별 의상마다 팔다리가 이중으로 그려지던 문제를 근본적으로
    // 없앤다(lib/domain/characterFullBody.ts, scripts/normalize_outfits.py 참고).
    const portraitKey = { kind, childGender, childStage };
    const headKey = characterPortraitKeyFor(portraitKey);

    // 헤어스타일 오버레이 — 민머리 베이스 위에 스타일별 그림을 얹는다(docs/PROGRESS.md 기록).
    // 해당 kind/스타일 조합에 그림 자산이 없으면(예: 새싹 bun) hairAssetKey가 null이 되고,
    // 기존처럼 고정 헤어스타일이 그려진 head 그림 + hairColor 마스크로 폴백한다. 현재 UI에서
    // 고를 수 있는 모든 헤어스타일은 실제로는 전부 이 매핑을 가지고 있어서 useBaldHead는
    // 사실상 항상 true다 — headDims를 여기서 먼저 정해야 하는 이유(아래 참고).
    const hairAssetKey = resolveHairAssetKey(portraitKey, a.hairStyle);
    const hairPlacement = hairAssetKey ? HAIR_ASSET_PLACEMENT[hairAssetKey] : null;
    const useBaldHead = Boolean(hairAssetKey && hairPlacement);

    // 민머리 이미지(head_bald/*.png)와 고정 헤어스타일 이미지(head/*.png)는 종횡비가 전혀
    // 다르다(해녀 기준 0.85 vs 1.23) — 예전엔 이 구분 없이 항상 HEAD_SIZE(고정 헤어스타일
    // 쪽 종횡비)로 렌더링 높이를 계산해서, 실제로 거의 항상 쓰이는 민머리 경로에서 얼굴이
    // 세로로 최대 44%까지 늘어나 그려지는 버그가 있었다(올림머리처럼 머리숱이 얼굴 옆을 안
    // 가리는 스타일에서 특히 두드러짐). useBaldHead 여부에 따라 맞는 크기 테이블과 여유값을
    // 골라 써야 한다.
    const headDims = useBaldHead ? HEAD_BALD_SIZE[headKey] : HEAD_SIZE[headKey];
    // 머리가 목선 위로 올라가는 만큼(headMarginTop) 항상 포함한 "전체 캔버스" 기준으로
    // scale을 잡아야, size가 아래 kind-없는 벡터 폴백 렌더링과 똑같이 "머리~발끝 실제
    // 높이"를 의미하게 된다 — 안 그러면 머리가 컨테이너 밖으로 넘쳐서 size가 같아도
    // outfitAssetKey 캐릭터만 유독 커 보이는 버그가 생긴다. kind마다 머리 종횡비가 달라
    // 필요한 여유가 다르므로(해녀 91 vs 해남 33) headMarginTopFor()로 kind별 값을 쓴다 —
    // 안 그러면 해남 캐릭터가 해녀보다 실제로 더 작게 렌더링되는 버그가 생긴다(실측 확인).
    const headMarginTop = headMarginTopFor(headKey, useBaldHead);
    const totalCanvasH = OUTFIT_CANVAS_H + headMarginTop;
    const scale = size / totalCanvasH;
    const width = Math.round(OUTFIT_CANVAS_W * scale);
    const height = size;
    // 바깥 박스는 항상 같은 크기(레이아웃 자리 유지)로 두고, 안쪽 캐릭터만 kindScale로
    // 줄여서 하단(발 기준선) 정렬 — 해남/해녀가 같은 바닥선에 서 있으면서 키 차이만 남는다.
    const kindScale = heightScaleFor(kind, childStage);
    const innerScale = scale * kindScale;
    const innerWidth = OUTFIT_CANVAS_W * innerScale;
    const innerHeight = totalCanvasH * innerScale;
    const outfitTop = headMarginTop * innerScale;
    const headRenderW = HEAD_WIDTH * innerScale;
    const headRenderH = (headDims.h / headDims.w) * headRenderW;
    const headLeft = (OUTFIT_CANVAS_W - HEAD_WIDTH) / 2 * innerScale;
    const headTop = (headMarginTop + NECK_Y + HEAD_OVERLAP) * innerScale - headRenderH;

    const hairOverlayRenderW = hairPlacement ? headRenderW * hairPlacement.widthFrac : 0;
    const hairOverlayRenderH = hairPlacement ? (hairPlacement.h / hairPlacement.w) * hairOverlayRenderW : 0;
    const hairOverlayLeft = hairPlacement ? headLeft + headRenderW * hairPlacement.leftFrac : 0;
    const hairOverlayTop = hairPlacement ? headTop + headRenderH * hairPlacement.topFrac : 0;

    const hatDims = a.hatAssetKey ? HAT_SIZE[a.hatAssetKey] : null;
    const hatPlacement = a.hatAssetKey ? HAT_PLACEMENT[a.hatAssetKey] : null;
    const hatRenderW = hatDims && hatPlacement ? headRenderW * hatPlacement.widthFrac : 0;
    const hatRenderH = hatDims ? (hatDims.h / hatDims.w) * hatRenderW : 0;
    const hatOffsetX = hatPlacement?.offsetXFrac ? headRenderW * hatPlacement.offsetXFrac : 0;
    const hatLeft = headLeft + headRenderW / 2 - hatRenderW / 2 + hatOffsetX;
    const hatBottom = hatPlacement ? headTop + headRenderH * hatPlacement.bottomFrac : 0;
    const hatTop = hatBottom - hatRenderH;

    const handDims = a.handAssetKey ? HAND_SIZE[a.handAssetKey] : null;
    const handPlacement = a.handAssetKey ? HAND_PLACEMENT[a.handAssetKey] : null;
    const handRenderW = handDims && handPlacement ? innerWidth * handPlacement.widthFrac : 0;
    const handRenderH = handDims ? (handDims.h / handDims.w) * handRenderW : 0;
    const handAnchorPxX = HAND_ACCESSORY_ANCHOR.x * innerScale;
    const handAnchorPxY = outfitTop + HAND_ACCESSORY_ANCHOR.y * innerScale;
    const handLeft = handPlacement ? handAnchorPxX - handRenderW * handPlacement.anchorX : 0;
    const handTop = handPlacement ? handAnchorPxY - handRenderH * handPlacement.anchorY : 0;

    const neckDims = a.neckAssetKey ? NECK_SIZE[a.neckAssetKey] : null;
    const neckPlacement = a.neckAssetKey ? NECK_PLACEMENT[a.neckAssetKey] : null;
    const neckRenderW = neckDims && neckPlacement ? innerWidth * neckPlacement.widthFrac : 0;
    const neckRenderH = neckDims ? (neckDims.h / neckDims.w) * neckRenderW : 0;
    const neckAnchorPxX = NECK_ACCESSORY_ANCHOR.x * innerScale;
    const neckAnchorPxY = outfitTop + NECK_ACCESSORY_ANCHOR.y * innerScale;
    const neckLeft = neckPlacement ? neckAnchorPxX - neckRenderW * neckPlacement.anchorX : 0;
    const neckTop = neckPlacement ? neckAnchorPxY - neckRenderH * neckPlacement.anchorY : 0;

    return (
      <div className={className} style={{ position: "relative", width, height, transform: flip ? "scaleX(-1)" : undefined }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: innerWidth, height: innerHeight }}>
          <Image
            src={outfitFullSrc(a.outfitAssetKey)}
            alt=""
            aria-hidden
            width={OUTFIT_CANVAS_W}
            height={OUTFIT_CANVAS_H}
            unoptimized
            style={{ position: "absolute", top: outfitTop, left: 0, width: innerWidth, height: OUTFIT_CANVAS_H * innerScale }}
          />
          <Image
            src={useBaldHead ? baldHeadSrc(portraitKey) : headSrc(portraitKey)}
            alt=""
            aria-hidden
            width={headDims.w}
            height={headDims.h}
            unoptimized
            style={{ position: "absolute", left: headLeft, top: headTop, width: headRenderW, height: headRenderH }}
          />
          {/* 피부톤은 얼굴 마스크 위에 mix-blend-mode:multiply로 입힌다 — outfitColor와 같은
              방식(마스크 자체는 흰색+alpha, RGB는 항상 흰색). */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: headLeft,
              top: headTop,
              width: headRenderW,
              height: headRenderH,
              backgroundColor: a.skinTone,
              WebkitMaskImage: `url(${useBaldHead ? baldSkinMaskSrc(portraitKey) : characterSkinMaskSrc(portraitKey)})`,
              maskImage: `url(${useBaldHead ? baldSkinMaskSrc(portraitKey) : characterSkinMaskSrc(portraitKey)})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              mixBlendMode: "multiply",
            }}
          />
          {useBaldHead && hairAssetKey && (
            <Image
              src={hairOverlaySrc(portraitKey, hairAssetKey.slice(-2))}
              alt=""
              aria-hidden
              width={hairPlacement!.w}
              height={hairPlacement!.h}
              unoptimized
              style={{ position: "absolute", left: hairOverlayLeft, top: hairOverlayTop, width: hairOverlayRenderW, height: hairOverlayRenderH }}
            />
          )}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: useBaldHead ? hairOverlayLeft : headLeft,
              top: useBaldHead ? hairOverlayTop : headTop,
              width: useBaldHead ? hairOverlayRenderW : headRenderW,
              height: useBaldHead ? hairOverlayRenderH : headRenderH,
              backgroundColor: a.hairColor,
              WebkitMaskImage: `url(${useBaldHead && hairAssetKey ? hairOverlayMaskSrc(portraitKey, hairAssetKey.slice(-2)) : characterHairMaskSrc(portraitKey)})`,
              maskImage: `url(${useBaldHead && hairAssetKey ? hairOverlayMaskSrc(portraitKey, hairAssetKey.slice(-2)) : characterHairMaskSrc(portraitKey)})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              mixBlendMode: "multiply",
            }}
          />
          {a.hatAssetKey && hatDims && (
            <Image
              src={hatSrc(a.hatAssetKey)}
              alt=""
              aria-hidden
              width={hatDims.w}
              height={hatDims.h}
              unoptimized
              style={{ position: "absolute", left: hatLeft, top: hatTop, width: hatRenderW, height: hatRenderH }}
            />
          )}
          {a.handAssetKey && handDims && (
            <Image
              src={handAccessorySrc(a.handAssetKey)}
              alt=""
              aria-hidden
              width={handDims.w}
              height={handDims.h}
              unoptimized
              style={{ position: "absolute", left: handLeft, top: handTop, width: handRenderW, height: handRenderH }}
            />
          )}
          {a.neckAssetKey && neckDims && (
            <Image
              src={neckAccessorySrc(a.neckAssetKey)}
              alt=""
              aria-hidden
              width={neckDims.w}
              height={neckDims.h}
              unoptimized
              style={{ position: "absolute", left: neckLeft, top: neckTop, width: neckRenderW, height: neckRenderH }}
            />
          )}
        </div>
      </div>
    );
  }

  if (kind) {
    const key = characterPortraitKeyFor({ kind, childGender, childStage });
    const dims = PORTRAIT_SIZE[key];
    const height = size;
    const width = Math.round(height * (dims.w / dims.h));
    const maskSrc = characterOutfitMaskSrc({ kind, childGender, childStage });
    return (
      <div
        className={className}
        style={{ position: "relative", width, height, transform: flip ? "scaleX(-1)" : undefined }}
      >
        <Image
          src={characterPortraitSrc({ kind, childGender, childStage })}
          alt=""
          aria-hidden
          width={dims.w}
          height={dims.h}
          unoptimized
          style={{ width, height, display: "block" }}
        />
        {/* 기본 의상(흰 탱크탑+반바지) 자리만 outfitColor로 물들인다 — 헤어/피부는 원본 그대로 */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: a.outfitColor,
            WebkitMaskImage: `url(${maskSrc})`,
            maskImage: `url(${maskSrc})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            mixBlendMode: "multiply",
          }}
        />
      </div>
    );
  }

  const cx = 110;
  const headCy = 96;
  const headR = 60 * (0.9 + a.bodyScale * 0.1);
  const torsoTop = headCy + headR - 14;
  const torsoW = 92 * a.bodyScale;
  const torsoH = 76 * a.bodyScale;
  const legY = torsoTop + torsoH - 6;

  return (
    <svg
      viewBox="0 0 220 260"
      width={size}
      height={(size * 260) / 220}
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      role="img"
      aria-hidden
    >
      {/* 뒷머리 */}
      <HairBack style={a.hairStyle} color={a.hairColor} cx={cx} cy={headCy} r={headR} />

      {/* 다리 */}
      <rect x={cx - 30} y={legY} width={22} height={30 * a.bodyScale} rx={11} fill={a.skinTone} stroke={NAVY} strokeWidth="3" />
      <rect x={cx + 8} y={legY} width={22} height={30 * a.bodyScale} rx={11} fill={a.skinTone} stroke={NAVY} strokeWidth="3" />
      <ellipse cx={cx - 19} cy={legY + 30 * a.bodyScale + 2} rx={15} ry={8} fill="#2c3f66" stroke={NAVY} strokeWidth="2.5" />
      <ellipse cx={cx + 19} cy={legY + 30 * a.bodyScale + 2} rx={15} ry={8} fill="#2c3f66" stroke={NAVY} strokeWidth="2.5" />

      {/* 팔 */}
      <ellipse cx={cx - torsoW / 2 - 10} cy={torsoTop + torsoH * 0.45} rx={15} ry={32 * a.bodyScale} fill={a.skinTone} stroke={NAVY} strokeWidth="3" />
      <ellipse cx={cx + torsoW / 2 + 10} cy={torsoTop + torsoH * 0.45} rx={15} ry={32 * a.bodyScale} fill={a.skinTone} stroke={NAVY} strokeWidth="3" />
      {a.toned && (
        <>
          <path d={`M ${cx - torsoW / 2 - 16} ${torsoTop + torsoH * 0.3} q 6 14 0 28`} stroke={NAVY} strokeWidth="1.6" opacity={0.35} fill="none" />
          <path d={`M ${cx + torsoW / 2 + 16} ${torsoTop + torsoH * 0.3} q -6 14 0 28`} stroke={NAVY} strokeWidth="1.6" opacity={0.35} fill="none" />
        </>
      )}

      {/* 몸통 + 의상 */}
      <Outfit style={a.outfit} color={a.outfitColor} accent={a.outfitAccent} cx={cx} torsoTop={torsoTop} torsoW={torsoW} torsoH={torsoH} />

      {/* 소품 (스패너/태블릿) */}
      <Accessory style={a.accessory} cx={cx} y={torsoTop + torsoH * 0.4} />

      {/* 머리 */}
      <circle cx={cx} cy={headCy} r={headR} fill={a.skinTone} stroke={NAVY} strokeWidth="3.5" />

      {/* 볼터치 */}
      <ellipse cx={cx - headR * 0.5} cy={headCy + headR * 0.22} rx={10} ry={6} fill="#ffb3ab" opacity={0.55} />
      <ellipse cx={cx + headR * 0.5} cy={headCy + headR * 0.22} rx={10} ry={6} fill="#ffb3ab" opacity={0.55} />

      {/* 눈 (아주 작고 둥근 점눈) */}
      <circle cx={cx - headR * 0.34} cy={headCy + headR * 0.04} r={4.3 * a.eyeScale} fill={NAVY} />
      <circle cx={cx + headR * 0.34} cy={headCy + headR * 0.04} r={4.3 * a.eyeScale} fill={NAVY} />
      {a.eyeScale > 1.15 && (
        <>
          <circle cx={cx - headR * 0.34 + 1.4} cy={headCy + headR * 0.04 - 1.4} r={1.4} fill="#ffffff" />
          <circle cx={cx + headR * 0.34 + 1.4} cy={headCy + headR * 0.04 - 1.4} r={1.4} fill="#ffffff" />
        </>
      )}
      {a.eyelash && (
        <>
          <path d={`M ${cx - headR * 0.34 - 5} ${headCy + headR * 0.04 - 5} l -5 -4`} stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${cx + headR * 0.34 + 5} ${headCy + headR * 0.04 - 5} l 5 -4`} stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* 입 */}
      <path
        d={`M ${cx - 6} ${headCy + headR * 0.34} q 6 6 12 0`}
        stroke={NAVY}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* 앞머리 */}
      <HairFront style={a.hairStyle} color={a.hairColor} cx={cx} cy={headCy} r={headR} />

      {/* 모자 */}
      <Hat style={a.hat} cx={cx} top={headCy - headR} accent={a.outfitAccent} color={a.outfitColor} />
    </svg>
  );
});
