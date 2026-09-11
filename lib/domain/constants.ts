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
export const BONPPURI_WORK_TASKS = [
  "꽃에 물주기",
  "리본 묶기",
  "꽃 정리하기",
  "꽃다발 포장",
  "꽃병 씻기",
  "물 채우기",
  "전화 받기",
  "진상 손님 응대",
  "계산하기",
  "꽃 설명하기",
  "화분 설명하기",
  "화분 포장하기",
];
export const LIRI_WORK_TASKS = [
  "테이블 닦기",
  "반찬 나르기",
  "불판 정리",
  "주문 전달",
  "앞접시 놓기",
  "테이블 청소",
  "서빙하기",
  "곱창 굽기",
];
export const WORK_TAP_TARGET = 4;

export const DATE_TOPIC_CARD_REWARD_MIN = 2;
export const DATE_TOPIC_CARD_REWARD_MAX = 4;

// 데이트 콘텐츠 1 — 대화 주제 카드 뽑기. 하루 1회 커플(household 단위)이 함께 카드를 뽑아
// 대화를 나누고 완료 보상을 받는다. 알바 태스크 목록과 동일하게 정적 배열로 관리한다.
export const DATE_TOPIC_CARDS = [
  "서로에게 고마운 점 하나씩 말하기",
  "요즘 가장 기억에 남는 하루 이야기하기",
  "다음에 같이 가고 싶은 곳 말하기",
  "서로의 첫인상이 어땠는지 말하기",
  "지금 제일 듣고 싶은 말 해주기",
  "요즘 힘들었던 일 하나 털어놓기",
  "서로의 장점 세 가지씩 말하기",
  "같이 해보고 싶은 취미 이야기하기",
  "제일 좋아하는 상대방 모습 말하기",
  "오늘 있었던 소소한 행복 나누기",
  "10년 후 우리 모습 상상해서 말하기",
  "서로에게 배우고 싶은 점 말하기",
  "요즘 꽂힌 노래나 영상 공유하기",
  "상대방에게 받고 싶은 깜짝 선물 말하기",
  "함께한 추억 중 제일 좋았던 순간 말하기",
  "서로 애칭 새로 지어주기",
  "오늘 하루 점수 매기고 이유 말하기",
  "요즘 고민 하나씩 나누기",
];

export const DATE_GIFT_REWARD_MIN = 1;
export const DATE_GIFT_REWARD_MAX = 3;

// 데이트 콘텐츠 2 — 선물 보내기. 하루 1회, 로그인한 사용자 기준으로(파트너 각자 하루 1회)
// 기존 우편함(mailbox_items/claim) 인프라를 그대로 재사용해 다정한 메시지 + 작은 선용금
// 선물을 보낸다. 이 배열은 발신 시 함께 붙는 메시지 문구만 정적으로 관리한다.
export const DATE_GIFT_MESSAGES = [
  "오늘도 고생 많았어요. 작은 선물이에요!",
  "그냥, 당신 생각나서 보내요.",
  "매일매일 함께라서 행복해요.",
  "당신이 있어서 오늘도 든든해요.",
  "언제나 내 편이 되어줘서 고마워요.",
  "오늘 하루도 반짝반짝 빛났어요, 당신.",
  "작지만 마음을 가득 담아 보내요.",
  "당신 웃는 모습이 제일 좋아요.",
  "힘든 날엔 제가 있다는 거 잊지 마요.",
  "우리, 오늘도 서로에게 최고예요.",
];

export const DATE_PHOTO_REWARD_MIN = 2;
export const DATE_PHOTO_REWARD_MAX = 4;

export interface DateSpotLocation {
  key: string;
  label: string;
}

// 데이트 콘텐츠 3 — 데이트 스팟 인증샷. public/images/backgrounds/*.jpg(기존 화면 배경)를
// 그대로 데이트 장소 후보로 재사용한다 — 새 배경을 그리지 않는다.
export const DATE_SPOT_LOCATIONS: DateSpotLocation[] = [
  { key: "deck", label: "갑판 광장" },
  { key: "fishing", label: "낚시터" },
  { key: "jewelry", label: "귀금속점" },
  { key: "mess-room", label: "선내식당" },
  { key: "bonppuri", label: "본뿌리" },
  { key: "liri-gopchang", label: "리리양곱창" },
  { key: "shipping-office", label: "(주)해녀해운" },
  { key: "hall-of-fame", label: "명예의 전당" },
];

export const DATE_STAMP_CLEAR_BONUS = 5;

export interface DateStampDef {
  key: string;
  label: string;
}

// 데이트 콘텐츠 4 — 데이트 스탬프판. 하루 동안 커플이 함께 한 데이트 액티비티 6종을
// 체크리스트로 모아 보여준다(항해일지 통계 화면과 같은 스타일). 앞의 데이트 콘텐츠
// 1~3(대화 주제 카드/선물/인증샷)과, 이미 있던 낚시/갑판/선내식당 일일미션 완료 여부를
// 그대로 재사용해서 판정하므로 새로 추적해야 하는 상태가 없다.
export const DATE_STAMP_DEFS: DateStampDef[] = [
  { key: "topic_card", label: "대화 주제 카드" },
  { key: "gift", label: "선물 보내기" },
  { key: "photo", label: "인증샷 찍기" },
  { key: "fishing", label: "함께 낚시하기" },
  { key: "deck", label: "갑판 산책" },
  { key: "mess", label: "선내식당 식사" },
];

export const FISHING_DURATIONS = [4, 8] as const;

export const EMPTY_STATE_COPY = {
  inventory: "아직 가방이 가볍네요. 조업이나 알바를 해볼까요?",
  guestbook: "아직 아무도 다녀가지 않았어요.",
  notice: "선주 아랍이 아직 전달할 내용이 없대요.",
  fishing: "현재 조업 중이 아닙니다.",
  event: "현재 진행 중인 이벤트가 없습니다.",
};
