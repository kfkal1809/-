# 오디오 파일 넣는 곳

효과음(SFX)과 배경음악(BGM) 파일은 아래 경로에 **정확히 이 파일명**으로 넣으면 자동으로 적용됩니다.
코드 재배포/재빌드 없이 파일만 넣으면 바로 재생됩니다(경로는 `lib/audio/manifest.ts`에서 관리).

## 효과음 (SFX) — `public/audio/sfx/`

| 파일명 | 재생되는 상황 |
|---|---|
| `ui-click.mp3` | 주요 버튼/탭 클릭 (뽁/톡) |
| `attendance.mp3` | 출항하기 성공(중복 출석 제외) |
| `coin.mp3` | 선용금 획득, 아이템 판매 (짤랑) |
| `purchase.mp3` | 상점/커플링/혼인신고서 구매 성공 |
| `item-get.mp3` | 일반 아이템 획득 (뾰로롱) |
| `rare-item.mp3` | 희귀/에픽 아이템 획득 |
| `equip.mp3` | 옷/헤어/모자/소품 장착, 혼인신고 서명(부분) (사락/뿅) |
| `furniture-place.mp3` | 가구를 선실에 배치 (톡) |
| `furniture-pickup.mp3` | 가구를 가방으로 회수 |
| `fishing-start.mp3` | 자동조업 시작 |
| `fishing-result.mp3` | 조업 결과 수령 (첨벙) |
| `fishing-legendary.mp3` | 전설 등급 낚시/조리/복원 결과 (특별한 반짝) |
| `food.mp3` | 선내식당 주문/조리 결과 |
| `mission-complete.mp3` | 미션 완료/보상 수령 (아직 미션 기능 자체가 구현 전이라 연결 대기 중) |
| `guestbook.mp3` | 방명록 작성 완료 |
| `marriage.mp3` | 해연결호 혼인신고 최종 완료(양쪽 서명) |
| `notification.mp3` | 중요 알림(혼인신고 한쪽 서명 등) |

## 배경음악 (BGM) — `public/audio/bgm/`

화면(경로)에 따라 자동으로 전환됩니다.

| 파일명 | 재생되는 화면 | 요청하신 분위기 |
|---|---|---|
| `home.mp3` | `/home` | 잔잔하고 귀여운 바다/항구 |
| `cabin.mp3` | `/cabin`, `/cabin/edit`, `/cabin/[householdId]` 등 | 포근한 생활게임 |
| `deck.mp3` | `/deck` | 밝은 바닷바람 |
| `bonppuri.mp3` | `/stores/bonppuri` | 꽃집 카페 |
| `liri-gopchang.mp3` | `/stores/liri-gopchang` | 살짝 신나는 포장마차 |
| `fishing.mp3` | `/fishing` | 느긋한 바다 |

그 외 화면(온보딩, 지갑, 승선확인증, 메뉴 등)은 지정된 분위기가 없어서 재생 중이던 BGM을 자연스럽게 멈춥니다.

## 형식/용량 참고

- `.mp3` 권장(코드가 `.mp3` 확장자로 경로를 관리 중). 다른 형식(`.m4a`, `.ogg` 등)을 쓰려면
  `lib/audio/manifest.ts`의 `SFX_MANIFEST`/`BGM_MANIFEST` 경로만 같이 바꿔주면 됩니다.
- 효과음은 사용자 기기에 즉시 로드되는 것도 있어(자주 쓰는 `ui-click`/`coin`/`attendance`는
  앱 진입 직후 미리 로드) 너무 큰 용량은 피하는 게 좋습니다 — 1초 내외의 짧은 효과음은
  보통 수십~수백 KB 수준이면 충분합니다.
- 파일이 아직 없어도 앱은 정상 동작합니다(무음으로 조용히 넘어감) — 준비되는 대로 하나씩
  넣으면 그때부터 바로 재생됩니다.
