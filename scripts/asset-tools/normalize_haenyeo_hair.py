"""해녀 헤어 20종을 "최종 해녀 얼굴"(base/head_bald/haenyeo.png, 340x290) 기준의
공유 마스터 캔버스에 다시 배치한다.

배경: CharacterSprite.tsx는 헤어마다 HAIR_ASSET_PLACEMENT에 저장된 widthFrac/leftFrac/topFrac
값으로 매번 다른 위치·크기 보정을 해서 얹었다. 이 값들이 스타일마다 실측 없이 대충 잡혀 있어서
(주석 참고: "해녀 헤어 20종의 topFrac은 예전엔 전부 -0.1379로 동일했다") 헤어 중심과 얼굴 중심이
어긋나고, 정수리 위로 대머리가 드러나거나(헤어가 너무 아래), 반대로 얼굴을 완전히 덮는(헤어가
너무 아래로 두꺼운 경우) 문제가 있었다. 이 스크립트는 "런타임 개별 보정"을 완전히 없애기 위해,
헤어별 오프셋을 코드가 아니라 이미지 자체에 구워 넣는다 — 결과물은 전부 같은 크기(MASTER_CANVAS)
캔버스 안에 같은 좌표계로 배치되므로, CharacterSprite는 모든 해녀 헤어를 단 하나의 공통 위치/
크기 공식으로 그리면 된다(헤어별 예외 없음).

정렬 기준(마스터 앵커, 전부 base/head_bald/haenyeo.png 340x290 좌표계 기준 실측):
  HEAD_TOP_Y = 1      (정수리 알파 시작점)
  HEAD_CENTER_X = 169 (눈동자 중심 x 평균과 실루엣 bbox 중심 x가 모두 169 부근으로 일치)
  EYE_LINE_Y = 195    (눈동자 중심 y, 참고용 — 실제 정렬엔 안 씀)
  FACE_BOTTOM_Y = 287 (턱 끝)
  LEFT_EAR_X = 0, RIGHT_EAR_X = 339 (귀 폭 기준 — head_bald.png 자체가 귀 폭에 딱 맞게 크롭됨)

정렬 방법: "이마 라인"처럼 그림마다 주관적으로 다르게 보이는 지점을 억지로 찾기보다(스타일마다
가르마·앞머리 유무가 달라 신뢰도가 낮았다), 모든 헤어 PNG가 실제로는 캔버스 맨 위(알파 bbox의
y0)에서 머리카락이 시작하도록 그려져 있다는 사실(실측: 20개 전부 y0가 0~15px 사이)에 착안해,
"헤어 알파 bbox의 맨 위"를 "머리 정수리"로 보고 HEAD_TOP_Y에 맞춘다. 여기에 자연스러운 볼륨감을
위해 EXTRA_UP_FRONT(6px)만큼 살짝 더 올려 머리숱이 정수리를 완전히 덮게 한다 — 20개 전부
실제 합성 렌더링으로 시각 검증했다(다시 아래 붙임머리형 2종만 예외, BACK_HAIR_EXTRA_UP 참고).
가로 중심은 헤어 알파 bbox 중심 x를 HEAD_CENTER_X에 맞춘다.

예외 — 뒷머리(BACK_HAIR) 2종(19, 20): 이 두 장은 다른 18장과 달리 얼굴이 비칠 "구멍"이 전혀
없는 통짜 그림이다(중앙 세로 밴드를 스캔해도 전체 높이의 90%+ 구간에서 커버리지가 0으로
안 떨어짐 — 반투명 부분이 없다는 뜻). 원본을 다시 그리거나 잘라내지 않고(요청사항 준수)
그대로 살리는 유일한 방법은 레이어 순서를 "얼굴보다 뒤"로 바꾸는 것뿐이다 — 그러면 정수리
근처의 리본/집게핀만 얼굴 위로 살짝 보이고, 나머지 뭉치는 얼굴 뒤로 자연스럽게 숨어 옆/아래로
흘러내리는 머리카락만 보인다(같은 이유로 훨씬 더 크게 위로 당겨야 리본이 이마 위에서 보임 —
BACK_HAIR_EXTRA_UP). CharacterSprite.tsx에서 이 두 키만 "머리보다 먼저(뒤에) 그리기"로 분기
처리한다(HAIR_BACK_LAYER_KEYS, 코드 주석에 이유 기록).

사용법:
    python3 scripts/asset-tools/normalize_haenyeo_hair.py
"""

import os

from PIL import Image
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAR_DIR = os.path.join(ROOT, "public", "images", "character")
HAIR_DIR = os.path.join(CHAR_DIR, "haenyeo", "hair")
MASK_DIR = os.path.join(HAIR_DIR, "masks")
OUT_DIR = os.path.join(CHAR_DIR, "haenyeo", "hair_normalized")
OUT_MASK_DIR = os.path.join(OUT_DIR, "masks")

HEAD_TOP_Y = 1
HEAD_CENTER_X = 169
EXTRA_UP_FRONT = 6
BACK_HAIR_EXTRA_UP = {"19": 110, "20": 130}

# 공유 마스터 캔버스 — base/head_bald/haenyeo.png(340x290)와 같은 원점(0,0)이
# 캔버스 안의 (CANVAS_ORIGIN_X, CANVAS_ORIGIN_Y)에 오도록 잡은, 20종 전체가 위/아래/양옆
# 어디도 잘리지 않고 들어가는 크기(실측 범위: y -129~433, x -12.5~346에 여유를 더함).
CANVAS_W = 380
CANVAS_H = 600
CANVAS_ORIGIN_X = 20
CANVAS_ORIGIN_Y = 140

BACK_HAIR_KEYS = set(BACK_HAIR_EXTRA_UP.keys())


def alpha_bbox(im: Image.Image):
    arr = np.array(im)
    mask = arr[:, :, 3] > 20
    ys, xs = np.where(mask)
    return int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())


def normalize_one(idx: str):
    hair_path = os.path.join(HAIR_DIR, f"haenyeo_hair_{idx}.png")
    mask_path = os.path.join(MASK_DIR, f"haenyeo_hair_{idx}_mask.png")

    hair = Image.open(hair_path).convert("RGBA")
    x0, x1, y0, _y1 = alpha_bbox(hair)
    bbox_cx = (x0 + x1) / 2

    extra_up = BACK_HAIR_EXTRA_UP.get(idx, EXTRA_UP_FRONT)
    shift_y = HEAD_TOP_Y - y0 - extra_up
    shift_x = HEAD_CENTER_X - bbox_cx

    dest_x = round(CANVAS_ORIGIN_X + shift_x)
    dest_y = round(CANVAS_ORIGIN_Y + shift_y)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.alpha_composite(hair, (dest_x, dest_y))
    canvas.save(os.path.join(OUT_DIR, f"haenyeo_hair_{idx}.png"))

    if os.path.exists(mask_path):
        mask = Image.open(mask_path).convert("RGBA")
        mask_canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        mask_canvas.alpha_composite(mask, (dest_x, dest_y))
        mask_canvas.save(os.path.join(OUT_MASK_DIR, f"haenyeo_hair_{idx}_mask.png"))

    return dict(bbox_cx=bbox_cx, y0=y0, shift_x=shift_x, shift_y=shift_y, is_back="예" if idx in BACK_HAIR_KEYS else "")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(OUT_MASK_DIR, exist_ok=True)
    print(f"마스터 캔버스: {CANVAS_W}x{CANVAS_H}, 머리 원점(head_bald 0,0) -> 캔버스 ({CANVAS_ORIGIN_X},{CANVAS_ORIGIN_Y})")
    for i in range(1, 21):
        idx = f"{i:02d}"
        info = normalize_one(idx)
        print(f"  {idx}: bbox_cx={info['bbox_cx']:.1f} y0={info['y0']} shift=({info['shift_x']:.1f},{info['shift_y']:.1f}) back={info['is_back']}")
    print(f"\n20개 해녀 헤어 정규화 완료 -> {OUT_DIR}")


if __name__ == "__main__":
    main()
