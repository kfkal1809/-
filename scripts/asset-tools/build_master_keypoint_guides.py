"""해남 + 새싹 6종(연령대x성별)의 MASTER 전신 캔버스 좌표를 실측해 의상 제작용
가이드 이미지를 만든다. build_haenyeo_master_canvas.py에서 해녀에 썼던 것과 동일한
측정 방법을 다른 kind에 그대로 적용한 것 — 아직 해남/새싹의 실제 outfit_full을
이 좌표로 다시 굽지는 않는다(그건 다음 단계). 이 스크립트는 "새 의상을 그릴 때 맞춰야
할 좌표"를 알려주는 참고 이미지만 만든다.

각 kind마다:
  1. base/<key>.png(그 kind의 MASTER 원본, design-assets 시트와 동일)에서
     목(neck_y, 폭 최솟값) · 손목(wrist_y, 팔+손 폭이 최대인 지점 이후 급격히
     좁아지는 곳) · 발바닥(sole_y, 알파 bbox 최하단)을 실측.
  2. base/head_bald/<key>.png(전체 화면을 꽉 채우는 민머리 크롭, 귀-귀 폭이 곧
     이미지 폭)와 base/<key>.png 자체의 귀-귀 폭을 대조해 두 좌표계 배율을 구함
     (해녀와 같은 방법 — build_haenyeo_master_canvas.py 상단 설명 참고).
  3. 캔버스는 base/<key>.png 크기에 위/양옆 여유를 더한 값, 그 안에 MASTER를
     배치한 좌표를 CANVAS_ORIGIN으로 기록.
  4. 가이드 이미지(캔버스 위에 MASTER를 35% 불투명도로 깔고 목선/어깨/손목/허리/
     발바닥 가로선 + 중심 세로선)를 public/images/character/master/guides/에 저장.

사용법:
    python3 scripts/asset-tools/build_master_keypoint_guides.py
"""

import os

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAR_DIR = os.path.join(ROOT, "public", "images", "character")
GUIDE_DIR = os.path.join(CHAR_DIR, "master", "guides")

KEYS = [
    "haenyeo",
    "haenam",
    "child_toddler_male",
    "child_toddler_female",
    "child_kindergarten_male",
    "child_kindergarten_female",
    "child_elementary_male",
    "child_elementary_female",
]

PADDING_TOP = 110
PADDING_SIDE = 42
PADDING_BOTTOM = 24


def alpha_bbox(arr_alpha):
    ys, xs = np.where(arr_alpha > 20)
    return int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())


def skin_ref_from_head_bald(head_bald: Image.Image):
    w, h = head_bald.size
    # 이마 근방(가로 중앙, 세로 28% 지점) — 눈/입/볼터치를 피하는 자리, 7종 전부 확인함.
    return np.array(head_bald.convert("RGBA").getpixel((int(w * 0.5), int(h * 0.28)))[:3])


def measure_ear_width(base_rgba: np.ndarray, skin_ref: np.ndarray, y_range):
    r, g, b, a = base_rgba[:, :, 0].astype(int), base_rgba[:, :, 1].astype(int), base_rgba[:, :, 2].astype(int), base_rgba[:, :, 3]
    dist = np.sqrt((r - skin_ref[0]) ** 2 + (g - skin_ref[1]) ** 2 + (b - skin_ref[2]) ** 2)
    skin = (a > 150) & (dist < 25)
    best_w, best_y, best_x0, best_x1 = 0, y_range[0], 0, 0
    for y in range(*y_range):
        row = skin[y]
        xs = np.where(row)[0]
        if len(xs):
            w = int(xs.max() - xs.min())
            if w > best_w:
                best_w, best_y, best_x0, best_x1 = w, y, int(xs.min()), int(xs.max())
    return best_w, best_y, (best_x0 + best_x1) / 2


def measure_neck_y(alpha: np.ndarray, search_from: int, search_to: int):
    """목은 탐색창 안의 전역 최솟값이 아니라 "머리 밑에서 처음 만나는 잘록한 지점"(첫
    번째 국소 최솟값)이다. 전역 최솟값으로 찾았더니 새싹 일부 캐릭터에서 목보다 훨씬
    아래(허리 근처)가 우연히 더 좁아서 그 지점을 목으로 잘못 짚었다(child_kindergarten_female
    실측 확인: 목 y=464 폭 181인데 y=564 폭 164로 더 좁음 — 전역 최솟값 방식이면 허리를
    목으로 오인). 3px 이동평균으로 잡음을 죽인 뒤, 감소하다가 처음 증가로 돌아서는
    지점을 목으로 본다."""
    widths = []
    for y in range(search_from, search_to):
        row = alpha[y] > 20
        xs = np.where(row)[0]
        widths.append(int(xs.max() - xs.min()) if len(xs) else 10**9)
    widths = np.array(widths, dtype=float)
    if len(widths) < 5:
        return search_from
    smoothed = np.convolve(widths, np.ones(3) / 3, mode="same")
    for i in range(2, len(smoothed) - 1):
        if smoothed[i] < smoothed[i - 1] and smoothed[i] <= smoothed[i + 1]:
            return search_from + i
    return search_from + int(np.argmin(smoothed))


def measure_wrist_and_sole(alpha: np.ndarray, neck_y: int):
    ys, xs = np.where(alpha > 20)
    sole_y = int(ys.max())
    widths = []
    for y in range(neck_y, sole_y):
        row = alpha[y] > 20
        xr = np.where(row)[0]
        widths.append(xr.max() - xr.min() if len(xr) else 0)
    widths = np.array(widths)
    total = len(widths)
    lo, hi = round(total * 0.30), round(total * 0.60)
    window = widths[lo:hi]
    if len(window) == 0:
        return neck_y + round(total * 0.4), sole_y
    max_idx = int(np.argmax(window)) + lo
    max_w = widths[max_idx]
    wrist_idx = max_idx
    for k in range(max_idx, total):
        if widths[k] < max_w * 0.75:
            wrist_idx = k
            break
    return neck_y + wrist_idx, sole_y


def process(key: str):
    base = Image.open(os.path.join(CHAR_DIR, "base", f"{key}.png")).convert("RGBA")
    head_bald = Image.open(os.path.join(CHAR_DIR, "base", "head_bald", f"{key}.png")).convert("RGBA")
    base_arr = np.array(base)
    alpha = base_arr[:, :, 3]
    x0, x1, y0, y1 = alpha_bbox(alpha)

    skin_ref = skin_ref_from_head_bald(head_bald)
    ear_w_base, ear_y_base, ear_x_center_base = measure_ear_width(base_arr, skin_ref, (y0, y0 + round((y1 - y0) * 0.5)))
    ear_w_headbald = head_bald.width  # full-bleed

    # 탐색창을 귀 폭의 0.65배까지로 좁힌다 — 처음엔 1.3배까지 열어놨더니 새싹처럼 머리숱이
    # 길게 늘어지는 캐릭터에서 탐색창이 몸통 전체(다리 사이 벌어짐 포함)까지 뻗어, 진짜
    # 목이 아니라 그보다 훨씬 아래의 우연한 좁은 지점을 "목"으로 잘못 짚는 사례가 실측 중
    # 발견됐다(child_kindergarten_female, child_elementary_female — 목/어깨/손목/허리/
    # 발바닥이 전부 거의 같은 y로 뭉개짐). 실측해보니 정수리~진짜 목까지 거리는 귀 폭의
    # 0.3~0.45배 안에 들어와서, 여유를 조금 더 둔 0.65배로 창을 좁혔다.
    neck_search_from = ear_y_base + round(ear_w_base * 0.15)
    neck_search_to = min(y1, ear_y_base + round(ear_w_base * 0.65))
    neck_y_base = measure_neck_y(alpha, neck_search_from, neck_search_to)

    wrist_y_base, sole_y_base = measure_wrist_and_sole(alpha, neck_y_base)

    canvas_w = base.width + PADDING_SIDE * 2
    canvas_h = base.height + PADDING_TOP + PADDING_BOTTOM
    offset_x, offset_y = PADDING_SIDE, PADDING_TOP

    neck_y = neck_y_base + offset_y
    shoulder_y = neck_y + round((wrist_y_base - neck_y_base) * 0.22)
    wrist_y = wrist_y_base + offset_y
    sole_y = sole_y_base + offset_y
    waist_y = round((wrist_y + sole_y) / 2 - (sole_y - wrist_y) * 0.15)
    center_x = ear_x_center_base + offset_x

    os.makedirs(GUIDE_DIR, exist_ok=True)
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
    faint = base.copy()
    farr = np.array(faint)
    farr[:, :, 3] = (farr[:, :, 3] * 0.35).astype("uint8")
    faint = Image.fromarray(farr, "RGBA")
    canvas.paste(faint, (offset_x, offset_y), faint)

    draw = ImageDraw.Draw(canvas)
    for y, label in [
        (neck_y, f"NECK_Y={neck_y}"),
        (shoulder_y, f"SHOULDER_Y={shoulder_y}"),
        (wrist_y, f"WRIST_Y={wrist_y}"),
        (waist_y, f"WAIST_Y={waist_y}"),
        (sole_y, f"SOLE_Y={sole_y}"),
    ]:
        draw.line([(0, y), (canvas_w, y)], fill=(220, 30, 30, 255), width=2)
        draw.text((6, y + 3), label, fill=(180, 0, 0, 255))
    draw.line([(center_x, 0), (center_x, canvas_h)], fill=(30, 120, 220, 255), width=1)
    draw.text((center_x + 4, 10), f"CENTER_X={center_x:.1f}", fill=(0, 80, 200, 255))
    draw.rectangle([(0, 0), (canvas_w - 1, canvas_h - 1)], outline=(0, 0, 0, 255), width=2)
    draw.text((6, 6), f"{key}  CANVAS {canvas_w}x{canvas_h}", fill=(0, 0, 0, 255))

    out_path = os.path.join(GUIDE_DIR, f"{key}_template_guide.png")
    canvas.save(out_path)

    print(
        f"{key}: canvas={canvas_w}x{canvas_h} scale_headbald={ear_w_headbald / ear_w_base:.4f} "
        f"NECK_Y={neck_y} SHOULDER_Y={shoulder_y} WRIST_Y={wrist_y} WAIST_Y={waist_y} SOLE_Y={sole_y} "
        f"CENTER_X={center_x:.1f} -> {out_path}"
    )


def main():
    for key in KEYS:
        process(key)


if __name__ == "__main__":
    main()
