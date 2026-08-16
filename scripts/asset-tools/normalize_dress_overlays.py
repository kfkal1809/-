""""드레스 오버레이" 의상 세트 정규화 파이프라인 (팔다리 없이 상의/원피스만 그려진 세트용).

`scripts/asset-tools/normalize_outfits.py`가 다루는 "목 아래 전신 인형" 세트와 달리, 이
세트는 원피스/상의만 그려져 있고(자체 팔다리 없음) 신발이 옷과 분리된 채로 떠 있는 3x3
그리드 시트다("캐릭터 의상 (1)~(N).png"). 팔다리가 없으므로 기본 체형 원본(팔다리 포함) 위에
"얹는" 방식을 쓴다 — 이전에 실패했던 방식(90장 인형 세트를 기본 체형에 얹기)과 달리 이번엔
옷 쪽에 팔다리가 없어서 이중으로 겹칠 게 없다.

사용법:
    python3 scripts/asset-tools/normalize_dress_overlays.py "design-assets/캐릭터 의상 (1).png" haenyeo

결과: public/images/character/<kind>/dress/dress_XX.png (원본 크롭),
      public/images/character/<kind>/dress_shoes/shoes_XX.png (신발 원본 크롭, 있는 경우),
      public/images/character/dress_full/<kind>_dress_XX.png (기본 체형에 합성된 완성 이미지,
      CharacterAppearance.fullPortraitKey로 바로 참조 가능).

3x3 그리드 가정이 안 맞는 시트(다른 배치)는 그리드 클러스터링 부분만 손보면 된다 — 나머지
(어깨폭 스케일, 신발 발 위치 앵커링)는 공용 로직이라 재사용된다.
"""

import glob
import os
import sys
from collections import defaultdict

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAR_DIR = os.path.join(ROOT, "public", "images", "character")

SHOULDER_PAD = 1.08  # 기본 체형 어깨폭보다 살짝 넉넉하게(속옷 끈이 안 비치도록)
NECK_RAISE = 12  # 옷 상단을 목선보다 살짝 위로 올려서 자연스럽게 겹치게
TARGET_SHOE_W = 130  # 신발 너비 목표(px) — 기본 체형 발 크기에 맞춰 실측한 값
SHOE_RAISE = 8  # 신발을 바닥선보다 살짝 위로 올려서 발이 파묻히지 않게


def _largest_component_only(im: Image.Image) -> Image.Image:
    arr = np.array(im)
    mask = arr[:, :, 3] > 20
    labeled, n = ndimage.label(mask)
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    largest = int(np.argmax(sizes)) + 1
    keep = labeled == largest
    cleaned = arr.copy()
    cleaned[~keep, 3] = 0
    ys, xs = np.where(keep)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    return Image.fromarray(cleaned).crop((x0, y0, x1 + 1, y1 + 1))


def extract_grid(sheet_path: str, kind: str) -> int:
    """3x3 시트를 셀별로 클러스터링 — 셀 안에서 가장 작은 덩어리를 신발로, 나머지(옷+가방)는
    합쳐서 원본 크롭으로 저장. 셀에 덩어리가 하나뿐이면 신발 없이 옷만 저장."""
    im = Image.open(sheet_path).convert("RGBA")
    arr = np.array(im)
    mask = arr[:, :, 3] > 20
    labeled, n = ndimage.label(mask)
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    h, w = mask.shape
    cell_h, cell_w = h / 3, w / 3

    groups = defaultdict(list)
    for i, s in enumerate(sizes, start=1):
        if s <= 400:
            continue
        ys, xs = np.where(labeled == i)
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        cy, cx = (y0 + y1) / 2, (x0 + x1) / 2
        row = min(2, int(cy // cell_h))
        col = min(2, int(cx // cell_w))
        groups[(row, col)].append((int(s), y0, y1, x0, x1))

    dress_dir = os.path.join(CHAR_DIR, kind, "dress")
    shoes_dir = os.path.join(CHAR_DIR, kind, "dress_shoes")
    os.makedirs(dress_dir, exist_ok=True)
    os.makedirs(shoes_dir, exist_ok=True)

    idx = 1
    pad = 6
    for row in range(3):
        for col in range(3):
            parts = groups.get((row, col), [])
            if not parts:
                continue
            parts_sorted = sorted(parts, key=lambda p: p[0])
            if len(parts_sorted) >= 2:
                _, sy0, sy1, sx0, sx1 = parts_sorted[0]
                garment_parts = parts_sorted[1:]
                shoes_crop = im.crop((max(0, sx0 - pad), max(0, sy0 - pad), min(w, sx1 + pad), min(h, sy1 + pad)))
                shoes_crop.save(os.path.join(shoes_dir, f"shoes_{idx:02d}.png"))
            else:
                garment_parts = parts_sorted
            gy0 = min(p[1] for p in garment_parts)
            gy1 = max(p[2] for p in garment_parts)
            gx0 = min(p[3] for p in garment_parts)
            gx1 = max(p[4] for p in garment_parts)
            garment_crop = im.crop((max(0, gx0 - pad), max(0, gy0 - pad), min(w, gx1 + pad), min(h, gy1 + pad)))
            garment_crop.save(os.path.join(dress_dir, f"dress_{idx:02d}.png"))
            idx += 1
    return idx - 1


def _base_anchors(base: Image.Image):
    barr = np.array(base)
    balpha = barr[:, :, 3]
    bmask = balpha > 20
    h, w = bmask.shape
    widths = np.zeros(h, dtype=int)
    for y in range(h):
        xs = np.where(bmask[y])[0]
        if len(xs):
            widths[y] = xs.max() - xs.min()
    head_max_y = int(np.argmax(widths[: int(h * 0.35)]))
    neck_y = head_max_y + int(np.argmin(widths[head_max_y : int(h * 0.6)]))
    row = balpha[neck_y + 25]
    xs = np.where(row > 20)[0]
    shoulder_w = xs.max() - xs.min()
    shoulder_cx = (xs.max() + xs.min()) / 2
    foot_row = balpha[int(h * 0.98)]
    fxs = np.where(foot_row > 20)[0]
    foot_cx = (fxs.max() + fxs.min()) / 2
    return neck_y, shoulder_w, shoulder_cx, foot_cx, h - 1


def compose_all(kind: str) -> list[str]:
    base_path = os.path.join(CHAR_DIR, "base", f"{kind}.png")
    base = Image.open(base_path).convert("RGBA")
    neck_y, shoulder_w, shoulder_cx, foot_cx, foot_bottom_y = _base_anchors(base)

    out_dir = os.path.join(CHAR_DIR, "dress_full")
    os.makedirs(out_dir, exist_ok=True)
    keys = []

    garment_files = sorted(glob.glob(os.path.join(CHAR_DIR, kind, "dress", "dress_*.png")))
    for gf in garment_files:
        idx = os.path.splitext(os.path.basename(gf))[0].split("_")[1]
        canvas = base.copy()

        dress_trim = _largest_component_only(Image.open(gf).convert("RGBA"))
        dw, dh = dress_trim.size
        dtarr = np.array(dress_trim)
        # 상단 30%에서 가장 넓은 지점을 어깨폭 기준으로 — 퍼프소매든 얇은 끈이든 안정적으로 잡힘.
        top_band = dtarr[: int(dh * 0.30), :, 3]
        row_widths = [np.where(top_band[r] > 20)[0] for r in range(top_band.shape[0])]
        row_widths = [(rxs.max() - rxs.min()) for rxs in row_widths if len(rxs)]
        dress_shoulder_w = max(row_widths) if row_widths else dw

        scale = (shoulder_w * SHOULDER_PAD) / dress_shoulder_w
        new_w, new_h = round(dw * scale), round(dh * scale)
        dress_scaled = dress_trim.resize((new_w, new_h), Image.LANCZOS)
        px = round(shoulder_cx - new_w / 2)
        py = neck_y - NECK_RAISE
        canvas.alpha_composite(dress_scaled, (px, py))

        shoes_path = os.path.join(CHAR_DIR, kind, "dress_shoes", f"shoes_{idx}.png")
        if os.path.exists(shoes_path):
            shoes_trim = _largest_component_only(Image.open(shoes_path).convert("RGBA"))
            sw, sh = shoes_trim.size
            sscale = TARGET_SHOE_W / sw
            snew_w, snew_h = round(sw * sscale), round(sh * sscale)
            shoes_scaled = shoes_trim.resize((snew_w, snew_h), Image.LANCZOS)
            spx = round(foot_cx - snew_w / 2)
            spy = foot_bottom_y - snew_h + SHOE_RAISE
            canvas.alpha_composite(shoes_scaled, (spx, spy))

        out_key = f"{kind}_dress_{idx}"
        canvas.save(os.path.join(out_dir, f"{out_key}.png"))
        keys.append(out_key)
    return keys


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    sheet_path, kind = sys.argv[1], sys.argv[2]
    n = extract_grid(sheet_path, kind)
    print(f"{n}개 항목 추출 완료 (public/images/character/{kind}/dress, dress_shoes)")
    keys = compose_all(kind)
    for k in keys:
        print(f"  합성 완료: {k}")
    print(f"\n필요하면 lib/domain/itemAppearance.ts에서 fullPortraitKey로 연결하세요.")
