import { describe, expect, it } from "vitest";
import { SFX_MANIFEST, BGM_MANIFEST, bgmKeyForPath, SFX_PRELOAD, type SfxKey } from "./manifest";

describe("SFX_MANIFEST", () => {
  it("모든 키가 public/audio/sfx/ 아래 .mp3 경로를 가리킨다", () => {
    for (const [key, path] of Object.entries(SFX_MANIFEST)) {
      expect(path).toBe(`/audio/sfx/${key}.mp3`);
    }
  });

  it("16개 효과음 키가 스펙과 정확히 일치한다", () => {
    const expected: SfxKey[] = [
      "ui-click",
      "attendance",
      "coin",
      "purchase",
      "item-get",
      "rare-item",
      "equip",
      "furniture-place",
      "furniture-pickup",
      "fishing-start",
      "fishing-result",
      "fishing-legendary",
      "food",
      "mission-complete",
      "guestbook",
      "marriage",
      "notification",
    ];
    expect(Object.keys(SFX_MANIFEST).sort()).toEqual([...expected].sort());
  });

  it("SFX_PRELOAD의 모든 키가 실제 매니페스트에 존재한다", () => {
    for (const key of SFX_PRELOAD) {
      expect(SFX_MANIFEST[key]).toBeDefined();
    }
  });
});

describe("BGM_MANIFEST", () => {
  it("7개 배경음악 키가 스펙과 일치한다(홈/선실/갑판/본뿌리/리리양곱창/낚시터/옷가게)", () => {
    expect(Object.keys(BGM_MANIFEST).sort()).toEqual(
      ["home", "cabin", "deck", "bonppuri", "liri-gopchang", "fishing", "clothing"].sort()
    );
  });

  it("모든 키가 public/audio/bgm/ 아래 .mp3 경로를 가리킨다", () => {
    for (const [key, path] of Object.entries(BGM_MANIFEST)) {
      expect(path).toBe(`/audio/bgm/${key}.mp3`);
    }
  });
});

describe("bgmKeyForPath", () => {
  it("각 게임 화면 경로를 올바른 BGM 키로 매핑한다", () => {
    expect(bgmKeyForPath("/home")).toBe("home");
    expect(bgmKeyForPath("/cabin")).toBe("cabin");
    expect(bgmKeyForPath("/cabin/edit")).toBe("cabin");
    expect(bgmKeyForPath("/cabin/some-household-id")).toBe("cabin");
    expect(bgmKeyForPath("/deck")).toBe("deck");
    expect(bgmKeyForPath("/stores/bonppuri")).toBe("bonppuri");
    expect(bgmKeyForPath("/stores/liri-gopchang")).toBe("liri-gopchang");
    expect(bgmKeyForPath("/fishing")).toBe("fishing");
    expect(bgmKeyForPath("/stores/clothing")).toBe("clothing");
  });

  it("BGM이 지정되지 않은 화면은 기본값(home)을 반환한다(무음 대신 메인 BGM)", () => {
    expect(bgmKeyForPath("/")).toBe("home");
    expect(bgmKeyForPath("/wallet")).toBe("home");
    expect(bgmKeyForPath("/onboarding/me")).toBe("home");
    expect(bgmKeyForPath("/boarding-pass/abc")).toBe("home");
    expect(bgmKeyForPath("/menu")).toBe("home");
  });

  it("BGM_ROUTE_MAP 순서와 무관하게 첫 매칭 규칙을 사용한다", () => {
    // /deck과 /decks 같은 우발적 prefix 오탐이 없는지 확인 — 매칭 안 되면 기본값(home)
    expect(bgmKeyForPath("/decking")).toBe("home");
  });
});
