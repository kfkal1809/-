// 지나가는 선박 랜덤 조우 이벤트 — 선종별 설정 (데이터 기반, 코드에 선종별 분기 없음)

export type ShipHullShape = "boxy" | "tanker" | "carrier";

export interface ShipTypeConfig {
  key: string;
  name: string;
  themeLabel: string;
  spawnWeight: number;
  hullColor: string;
  deckColor: string;
  accentColor: string;
  hullShape: ShipHullShape;
  cashMin: number;
  cashMax: number;
  catalogSubcategory: string;
  itemChance: number; // 현금 보상 외 아이템이 함께 나올 확률(0~1)
  // 실제 일러스트(design-assets/선박모형 (N).png에서 정리, public/images/ships/ship_<key>.png).
  // 없으면 ShipSprite가 기존 hullColor/deckColor/accentColor/hullShape 기반 절차적 SVG로
  // 폴백한다 — hullColor 등 필드를 지우지 않고 그대로 둔 이유이기도 하다.
  imageSrc?: string;
  // 원본 그림의 실측 가로:세로 비율(w/h) — width만 주고 height를 비율대로 계산할 때 씀.
  imageAspect?: number;
}

export const SHIP_TYPES: ShipTypeConfig[] = [
  {
    key: "container",
    name: "컨테이너선",
    themeLabel: "세계 곳곳의 컨테이너를 실은 배가 지나가요",
    spawnWeight: 25,
    hullColor: "#e8563f",
    deckColor: "#f7b23c",
    accentColor: "#2f5fa8",
    hullShape: "boxy",
    cashMin: 0.5,
    cashMax: 1.5,
    catalogSubcategory: "ship_container",
    itemChance: 0.35,
    imageSrc: "/images/ships/ship_container.png",
    imageAspect: 1.481,
  },
  {
    key: "bulk",
    name: "벌크선",
    themeLabel: "곡물과 원자재를 가득 실은 벌크선이 지나가요",
    spawnWeight: 20,
    hullColor: "#5b7a94",
    deckColor: "#d8cdb8",
    accentColor: "#3a4f63",
    hullShape: "boxy",
    cashMin: 0.5,
    cashMax: 1.2,
    catalogSubcategory: "ship_bulk",
    itemChance: 0.3,
    imageSrc: "/images/ships/ship_bulk.png",
    imageAspect: 1.667,
  },
  {
    key: "tanker",
    name: "탱커선",
    themeLabel: "원유를 실은 탱커선이 유유히 지나가요",
    spawnWeight: 18,
    hullColor: "#2f6b57",
    deckColor: "#9fd6c4",
    accentColor: "#1c4136",
    hullShape: "tanker",
    cashMin: 0.8,
    cashMax: 1.8,
    catalogSubcategory: "ship_tanker",
    itemChance: 0.3,
    imageSrc: "/images/ships/ship_tanker.png",
    imageAspect: 1.524,
  },
  {
    key: "car_carrier",
    name: "카캐리선",
    themeLabel: "새 자동차를 가득 실은 카캐리선이 지나가요",
    spawnWeight: 15,
    hullColor: "#f4f7fb",
    deckColor: "#c9d6e6",
    accentColor: "#4a6fa5",
    hullShape: "carrier",
    cashMin: 1,
    cashMax: 2,
    catalogSubcategory: "ship_car_carrier",
    itemChance: 0.45,
    imageSrc: "/images/ships/ship_car_carrier.png",
    imageAspect: 1.811,
  },
  {
    key: "chemical",
    name: "케미컬선",
    themeLabel: "화학제품을 실은 케미컬선이 조심스레 지나가요",
    spawnWeight: 10,
    hullColor: "#9b6bc9",
    deckColor: "#e3d3f5",
    accentColor: "#5b3a86",
    hullShape: "tanker",
    cashMin: 1,
    cashMax: 2.2,
    catalogSubcategory: "ship_chemical",
    itemChance: 0.4,
    imageSrc: "/images/ships/ship_chemical.png",
    imageAspect: 1.5,
  },
  {
    key: "lng",
    name: "LNG선",
    themeLabel: "둥근 탱크가 특징인 LNG선이 지나가요",
    spawnWeight: 8,
    hullColor: "#3a86c8",
    deckColor: "#eef7ff",
    accentColor: "#1c4d7a",
    hullShape: "tanker",
    cashMin: 1.5,
    cashMax: 3,
    catalogSubcategory: "ship_lng",
    itemChance: 0.5,
    imageSrc: "/images/ships/ship_lng.png",
    imageAspect: 1.678,
  },
  {
    key: "vlcc",
    name: "VLCC선",
    themeLabel: "초대형 원유운반선 VLCC가 위용을 뽐내며 지나가요",
    spawnWeight: 4,
    hullColor: "#1e3a5f",
    deckColor: "#8fa8c4",
    accentColor: "#0f2136",
    hullShape: "tanker",
    cashMin: 2.5,
    cashMax: 5,
    catalogSubcategory: "ship_vlcc",
    itemChance: 0.6,
    imageSrc: "/images/ships/ship_vlcc.png",
    imageAspect: 2.162,
  },
];

export const SHIP_EVENT_CONFIG = {
  dailyMin: 2,
  dailyMax: 3,
  windowStartHour: 9, // KST
  windowEndHour: 23, // KST
  minGapMinutes: 90,
  gracePeriodHours: 6,
};
