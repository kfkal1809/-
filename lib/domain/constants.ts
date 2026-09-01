// 해기사와 연인들의 항해일지 — 정적 도메인 상수
// 기획서 A장/1장/9장 기준. 가격/보상 값은 운영자 admin 화면에서 추후 조정 가능하도록
// DB(mission_catalog, item_catalog)로도 동일하게 관리한다. 이 파일은 클라이언트 표시/폴백용.

export const APP_NAME = "해기사와 연인들의 항해일지";
export const APP_SHORT_NAME = "해연결 항해일지";
export const SHIP_NAME = "해연결호";

export const CURRENCY_NAME = "선용금";
export const CURRENCY_DISCLAIMER = "게임 내 선용금이며 실제 화폐로 환전되지 않습니다.";

export const WELCOME_GRANT_AMOUNT = 20;
export const APP_ATTENDANCE_REWARD = 1;
export const KAKAO_ATTENDANCE_REWARD = 1;

export interface NpcInfo {
  id: string;
  name: string;
  title: string;
  space: string;
  line: string;
}

export const NPCS: NpcInfo[] = [
  {
    id: "arab",
    name: "아랍",
    title: "선주",
    space: "(주)해녀해운",
    line: "의견을 남겨주세요. 최고의 서비스로 모시겠습니다.",
  },
  {
    id: "dubu",
    name: "두부",
    title: "조리장",
    space: "선내식당",
    line: "오늘도 기깔나게 요리 해드릴게요!",
  },
  {
    id: "mami",
    name: "마미",
    title: "사장",
    space: "본뿌리",
    line: "오늘은 어떤 꽃이 필요하세요?",
  },
  {
    id: "liri",
    name: "리리",
    title: "사장",
    space: "리리양곱창",
    line: "배고프면 언제든 들려요!",
  },
];

export interface HomeMenuItem {
  key: string;
  label: string;
  href: string;
  icon: string;
}

// 3x3 홈 기능 메뉴 — 순서 고정 (A-5 / 1.14)
export const HOME_MENU: HomeMenuItem[] = [
  { key: "deck", label: "갑판 광장", href: "/deck", icon: "deck" },
  { key: "duties", label: "선내업무", href: "/duties", icon: "clipboard" },
  { key: "inventory", label: "가방", href: "/inventory", icon: "bag" },
  { key: "fishing", label: "낚시터", href: "/fishing", icon: "fishing" },
  { key: "mess", label: "선내식당", href: "/mess-room", icon: "chef" },
  { key: "bonppuri", label: "본뿌리", href: "/stores/bonppuri", icon: "flower" },
  { key: "liri", label: "리리양곱창", href: "/stores/liri-gopchang", icon: "gopchang" },
  { key: "shipping", label: "(주)해녀해운", href: "/shipping", icon: "company" },
  { key: "hof", label: "명예의 전당", href: "/hall-of-fame", icon: "trophy" },
];

export interface BottomTabItem {
  key: string;
  label: string;
  href: string;
  icon: string;
}

// 고정 하단탭 (A-5 / 1.15)
export const BOTTOM_TABS: BottomTabItem[] = [
  { key: "home", label: "홈", href: "/home", icon: "home" },
  { key: "cabin", label: "선실", href: "/cabin", icon: "cabin" },
  { key: "deck", label: "갑판", href: "/deck", icon: "deck" },
  { key: "bag", label: "가방", href: "/inventory", icon: "bag" },
  { key: "menu", label: "메뉴", href: "/menu", icon: "menu" },
];

export interface DailyMissionDef {
  key: string;
  title: string;
  description: string;
  target: number;
  reward: number;
}

export const DAILY_MISSIONS: DailyMissionDef[] = [
  { key: "attendance", title: "출석", description: "앱 출항 1회", target: 1, reward: 1 },
  { key: "visit_bonppuri", title: "본뿌리 방문", description: "오늘 본뿌리 진입", target: 1, reward: 1 },
  { key: "visit_liri", title: "리리양곱창 방문", description: "오늘 리리양곱창 진입", target: 1, reward: 1 },
  { key: "visit_deck", title: "갑판 방문", description: "오늘 갑판 진입", target: 1, reward: 1 },
  { key: "guestbook", title: "방명록 작성", description: "서로 다른 선실 방명록 3회", target: 3, reward: 2 },
  { key: "fishing", title: "낚시", description: "4h/8h 자동낚시 1회 시작", target: 1, reward: 1 },
];
export const DAILY_CLEAR_BONUS = 2;

export interface WeeklyMissionDef {
  key: string;
  title: string;
  description: string;
  target: number;
  reward: number;
}

export const WEEKLY_MISSIONS: WeeklyMissionDef[] = [
  { key: "attendance5", title: "성실 승선", description: "앱 출석 5일", target: 5, reward: 5 },
  { key: "fishing5", title: "꾸준한 조업", description: "낚시 5회", target: 5, reward: 5 },
  { key: "cabin_visit5", title: "선실 순방", description: "서로 다른 선실 5곳 방문", target: 5, reward: 4 },
  { key: "deck_visit4", title: "갑판 단골", description: "서로 다른 4일 갑판 방문", target: 4, reward: 4 },
];
export const WEEKLY_CLEAR_BONUS = 7;

export const MESS_ROOM_MENU = [
  { key: "regular", name: "일반식", price: 8, description: "일반~희귀 꾸미기 아이템 1개" },
  { key: "special", name: "조리장 특식", price: 12, description: "희귀 확률 상승" },
  { key: "premium", name: "프리미엄 특식", price: 18, description: "희귀/한정 확률 추가 상승" },
];

export const BONPPURI_PRODUCTS = [
  { key: "season_bouquet", name: "계절 꽃다발", price: 18 },
  { key: "peony_bouquet", name: "작약 꽃다발", price: 24 },
  { key: "mini_vase", name: "미니 화병", price: 22 },
  { key: "peony_vase", name: "작약 화병", price: 30 },
  { key: "wedding_bouquet", name: "웨딩 부케", price: 32 },
  { key: "premium_bouquet", name: "프리미엄 부케", price: 40 },
  { key: "season_deco", name: "시즌 한정 꽃장식", price: 52 },
];

export const RING_SETS = [
  {
    key: "wave_ring",
    sku: "ring_wave",
    name: "파도 커플링",
    price: 10,
    description: "잔잔한 파도처럼 오래도록 서로의 곁을 지켜주는 사랑을 담은 커플링.",
  },
  {
    key: "shell_ring",
    sku: "ring_shell",
    name: "진주조개 커플링",
    price: 12,
    description: "조개 속 진주처럼 소중한 인연을 발견했다는 의미를 담은 커플링.",
  },
  {
    key: "lighthouse_ring",
    sku: "ring_lighthouse",
    name: "등대불빛 커플링",
    price: 15,
    description: "먼 바다에서도 서로를 향해 길을 밝혀주는 변함없는 사랑의 커플링.",
  },
];

export const MARRIAGE_DOCUMENT_PRICE = 20;

export const WORK_REWARD_MIN = 2;
export const WORK_REWARD_MAX = 4;

// 가게 알바 (1.38 / 1.40) — MVP는 복잡한 미니게임 대신 3~5회 탭으로 대체한다.
export const BONPPURI_WORK_TASKS = ["꽃에 물주기", "리본 묶기", "꽃 정리하기", "꽃다발 포장"];
export const LIRI_WORK_TASKS = ["테이블 닦기", "반찬 나르기", "불판 정리", "주문 전달", "앞접시 놓기"];
export const WORK_TAP_TARGET = 4;

export const FISHING_DURATIONS = [4, 8] as const;

export const EMPTY_STATE_COPY = {
  inventory: "아직 가방이 가볍네요. 조업이나 알바를 해볼까요?",
  guestbook: "아직 아무도 다녀가지 않았어요.",
  notice: "선주 아랍이 아직 전달할 내용이 없대요.",
  fishing: "현재 조업 중이 아닙니다.",
  event: "현재 진행 중인 이벤트가 없습니다.",
};
