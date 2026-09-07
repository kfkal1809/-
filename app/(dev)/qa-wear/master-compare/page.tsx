"use client";

import Image from "next/image";
import { HaenyeoMasterSprite } from "@/components/character/HaenyeoMasterSprite";
import { haenyeoPreset } from "@/lib/domain/characterPresets";
import {
  HAENYEO_MASTER_CANVAS_W,
  HAENYEO_MASTER_CANVAS_H,
  HAENYEO_MASTER_NECK_Y,
  HAENYEO_MASTER_WRIST_Y,
  HAENYEO_MASTER_SOLE_Y,
  HAENYEO_OUTFIT_VALID_KEYS,
  HAENYEO_OUTFIT_MISSING_KEYS,
  HAENYEO_OUTFIT_INVALID_KEYS,
  HAENYEO_HAIR_HIDDEN_FROM_PICKER,
} from "@/lib/domain/characterFullBody";

const SIZE = 480;
// 실제로 "검수 통과"한 번호만 나열한다 — 없는 번호를 다른 그림으로 대체하지 않고(2026-09-06),
// 파일은 있지만 내용이 깨진 번호(08/14/17)도 정상 목록에서 뺀다(2026-09-07).
const HAENYEO_OUTFIT_KEYS = Array.from(HAENYEO_OUTFIT_VALID_KEYS).sort();
const HAENYEO_OUTFIT_MISSING_LIST = Array.from(HAENYEO_OUTFIT_MISSING_KEYS).sort();
const HAENYEO_OUTFIT_INVALID_LIST = Array.from(HAENYEO_OUTFIT_INVALID_KEYS).sort();
const HAENYEO_HAIR_KEYS = Array.from({ length: 20 }, (_, i) => `${String(i + 1).padStart(2, "0")}`).filter(
  (idx) => !HAENYEO_HAIR_HIDDEN_FROM_PICKER.has(idx)
);
// 상단 A/B/C/D 비교 패널 전용 — 기본 프리셋의 outfitAssetKey(02)가 아직 없는 번호라, 데모
// 목적으로만 실제 존재하는 06을 임시로 덧씌운다(실제 게임 기본값을 바꾸는 게 아니다).
const DEMO_OUTFIT_KEY = "haenyeo_custom_outfit_06";

// MASTER 캔버스의 목선/손목/발바닥 y좌표를 SIZE 기준 %로 환산 — 가이드선 위치용.
const NECK_PCT = (HAENYEO_MASTER_NECK_Y / HAENYEO_MASTER_CANVAS_H) * 100;
const WRIST_PCT = (HAENYEO_MASTER_WRIST_Y / HAENYEO_MASTER_CANVAS_H) * 100;
const SOLE_PCT = (HAENYEO_MASTER_SOLE_Y / HAENYEO_MASTER_CANVAS_H) * 100;

function GuideLines() {
  const lines = [
    { pct: NECK_PCT, label: "목선" },
    { pct: WRIST_PCT, label: "손목" },
    { pct: SOLE_PCT, label: "발바닥" },
  ];
  return (
    <>
      {lines.map((l) => (
        <div key={l.label} aria-hidden style={{ position: "absolute", left: 0, right: 0, top: `${l.pct}%` }}>
          <div style={{ borderTop: "1.5px dashed rgba(255,0,0,0.55)" }} />
          <span style={{ position: "absolute", right: 2, top: 2, fontSize: 9, color: "rgba(200,0,0,0.8)", fontFamily: "monospace" }}>
            {l.label}
          </span>
        </div>
      ))}
    </>
  );
}

function Cell({ label, children, withGuides }: { label: string; children: React.ReactNode; withGuides?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        style={{
          position: "relative",
          width: Math.round((SIZE * HAENYEO_MASTER_CANVAS_W) / HAENYEO_MASTER_CANVAS_H),
          height: SIZE,
          background: "#eaf6ff",
          overflow: "hidden",
          border: "1px solid #ccc",
        }}
      >
        {children}
        {withGuides && <GuideLines />}
      </div>
      <p style={{ fontSize: 12, fontFamily: "monospace", textAlign: "center" }}>{label}</p>
    </div>
  );
}

export default function QaMasterCompare() {
  if (process.env.NODE_ENV === "production") return null;
  const defaultAppearance = haenyeoPreset();
  // 프리셋 기본값(outfitAssetKey="haenyeo_outfit_02")은 아직 원본이 없는 번호라, 실제
  // 게임 기본값을 바꾸지 않고 이 QA 페이지의 데모 표시용으로만 존재하는 06으로 덧씌운다.
  const demoAppearance = { ...defaultAppearance, outfitAssetKey: DEMO_OUTFIT_KEY };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 20, background: "white" }}>
      <h1 style={{ fontFamily: "monospace" }}>해녀 MASTER 캔버스 재구축 — A/B/C/D 비교 (빨간 점선 = 목선/손목/발바닥 가이드)</h1>
      <p style={{ fontFamily: "monospace", fontSize: 12 }}>
        MASTER 캔버스: {HAENYEO_MASTER_CANVAS_W}x{HAENYEO_MASTER_CANVAS_H}px · 파일: public/images/character/master/*
        <br />
        appearance: hairStyle=&quot;{demoAppearance.hairStyle}&quot; (hairAssetKey=03) · outfitAssetKey=&quot;{demoAppearance.outfitAssetKey}
        &quot;(데모용 — 실제 기본값 &quot;{defaultAppearance.outfitAssetKey}&quot;은 원본 미업로드)
        <br />
        <b style={{ color: "#c00" }}>
          검수 통과: {HAENYEO_OUTFIT_KEYS.length}종({HAENYEO_OUTFIT_KEYS.join(", ")}) · 누락(원본 미업로드):{" "}
          {HAENYEO_OUTFIT_MISSING_LIST.length}종({HAENYEO_OUTFIT_MISSING_LIST.join(", ")}) · 원본 결함(재업로드 필요):{" "}
          {HAENYEO_OUTFIT_INVALID_LIST.length}종({HAENYEO_OUTFIT_INVALID_LIST.join(", ")}) — 아래 그리드는 검수 통과한{" "}
          {HAENYEO_OUTFIT_KEYS.length}종만 표시합니다.
        </b>
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <Cell label="A. GitHub MASTER 해녀 원본 (정면)" withGuides>
          <Image
            src="/qa-master-ref-haenyeo.png"
            alt=""
            width={347}
            height={762}
            unoptimized
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Cell>
        <Cell label="B. MASTER 위에 헤어만 착용 (wave=03)" withGuides>
          <HaenyeoMasterSprite appearance={demoAppearance} size={SIZE} hideOutfit showDebugLabel />
        </Cell>
        <Cell label={`C. MASTER 위에 의상만 (${DEMO_OUTFIT_KEY}, 데모용)`} withGuides>
          <HaenyeoMasterSprite appearance={demoAppearance} size={SIZE} hideHair showDebugLabel />
        </Cell>
        <Cell label="D. 헤어+의상 최종 (데모용 의상)" withGuides>
          <HaenyeoMasterSprite appearance={demoAppearance} size={SIZE} showDebugLabel />
        </Cell>
      </div>

      <h2 style={{ fontFamily: "monospace" }}>
        해녀 옷 — 실제 파일이 존재하는 {HAENYEO_OUTFIT_KEYS.length}종만 (동일 배율, 기본 wave 헤어 고정). 01~05,07은
        원본이 없어 목록에서 제외했습니다(다른 번호로 대체 표시하지 않음).
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {HAENYEO_OUTFIT_KEYS.map((key) => (
          <Cell key={key} label={key}>
            <HaenyeoMasterSprite appearance={{ ...defaultAppearance, outfitAssetKey: key }} size={260} showDebugLabel />
          </Cell>
        ))}
      </div>

      <h2 style={{ fontFamily: "monospace" }}>
        누락 6종({HAENYEO_OUTFIT_MISSING_LIST.join(", ")}) — 대체 없이 실제로 어떻게 보이는지 확인용
      </h2>
      <p style={{ fontFamily: "monospace", fontSize: 11, color: "#555" }}>
        06으로 대체하지 않습니다. 의상 레이어 자체를 그리지 않아 MASTER 몸의 기본 이너웨어만 보입니다(개발자
        콘솔에 &quot;design-assets/haenyeo_outfit_XX.png 원본 없음&quot; 경고가 남습니다).
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {HAENYEO_OUTFIT_MISSING_LIST.map((key) => (
          <Cell key={key} label={`${key} (누락 — 대체 없음)`}>
            <HaenyeoMasterSprite appearance={{ ...defaultAppearance, outfitAssetKey: key }} size={260} showDebugLabel />
          </Cell>
        ))}
      </div>

      <h2 style={{ fontFamily: "monospace" }}>
        원본 결함 3종({HAENYEO_OUTFIT_INVALID_LIST.join(", ")}) — 파일은 있지만 내용이 깨져 정상 목록에서 제외
      </h2>
      <p style={{ fontFamily: "monospace", fontSize: 11, color: "#555" }}>
        08: 상의 없이 장화만 있음 · 14: 상의 없이 스커트만 있고 허리폭이 과함 · 17: 베레모가 머리가 아니라
        목/가슴 위치에 그려져 있음 — 전부 design-assets 원본 자체의 결함(제 파이프라인이 만든 문제 아님, raw
        PNG를 직접 열어서 확인함). 재업로드 전까지 이 레이어도 대체 없이 생략됩니다.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {HAENYEO_OUTFIT_INVALID_LIST.map((key) => (
          <Cell key={key} label={`${key} (원본 결함)`}>
            <HaenyeoMasterSprite appearance={{ ...defaultAppearance, outfitAssetKey: key }} size={260} showDebugLabel />
          </Cell>
        ))}
      </div>

      <h2 style={{ fontFamily: "monospace" }}>
        해녀 헤어 — 검수 통과 {HAENYEO_HAIR_KEYS.length}종만 (동일 배율, 의상 {DEMO_OUTFIT_KEY} 고정 — 데모용,
        실제 기본 의상 아님). 눈 가림 정량 실측(눈 좌표 반경 알파 커버리지) 결과 얼굴을 심하게 가리는
        01,02,04,08,09,10,13,14,15,18과 정면 앞머리가 없는(뒷모습 원화) 19,20은 제외했습니다. 각 헤어별로
        MASTER 몸도 전용 변형(두상 외곽선이 머리카락 밖으로 새지 않게 정리된 버전)을 씁니다.
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {HAENYEO_HAIR_KEYS.map((idx) => (
          <Cell key={idx} label={`hair_${idx}`}>
            <HaenyeoMasterSprite appearance={demoAppearance} hairAssetKeyOverride={idx} size={260} showDebugLabel />
          </Cell>
        ))}
      </div>
    </div>
  );
}
