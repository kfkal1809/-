"""dress_full/*.png(얼굴까지 포함된 완성 전신 합성 이미지, fullPortraitKey 전용)를
outfit_full/*.png(목 아래만, outfitAssetKey 전용) 규격으로 변환한다.

배경: dress_full은 normalize_dress_overlays.py가 "base/<kind>.png(마스터 기본 체형) 그대로
copy() + 그 위에 원피스를 얹은" 캔버스라, 원피스 이미지 안에도 마스터 체형이 그대로 들어있다
(다른 그림이 아니다). 문제는 CharacterSprite의 렌더링 공식이 서로 다르다는 것 — outfitAssetKey
경로는 머리(HEAD_SIZE 등 고정 상수)와 몸통(outfit_full, NECK_Y 앵커)을 따로 그리는데,
fullPortraitKey 경로는 캔버스 전체를 "height = size" 하나로 뭉뚱그려 스케일한다. 이 두 공식이
안 맞아서(누구도 일치하도록 보정한 적이 없음) 같은 해녀인데도 원피스를 입으면 머리 크기·키·
다리 길이가 확 달라 보였다(사용자가 스크린샷으로 실제 지적, qa-wear/outfits 캡처로도 확인됨).

고치는 방법: dress_full 캔버스에서 마스터 체형의 목선(base/<kind>.png에서 계산한 neck_y,
normalize_dress_overlays.py의 _base_anchors와 동일한 로직) 아래만 잘라내면 "목 아래 전신
의상"(outfit_full이 원래 기대하는 입력 형태)이 남는다. 이걸 normalize_outfits.py와 완전히
같은 정규화 함수(largest-component-only → trim → TARGET_H/NECK_Y 캔버스 배치)에 통과시키면
outfitAssetKey 경로와 정확히 같은 공식으로 렌더링된다 — 그림을 새로 그리거나 다시 해석하지
않고, 이미 승인된 합성 이미지를 "머리 위/목 아래"로 자르기만 한다.

사용법:
    python3 scripts/asset-tools/convert_dress_full_to_outfit.py
"""

import glob
import os
import re

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAR_DIR = os.path.join(ROOT, "public", "images", "character")

OUTFIT_CANVAS_W = 420
OUTFIT_CANVAS_H = 512
NECK_Y = 140
TARGET_H = 350
MAX_W = 380
NECK_RAISE = 12  # normalize_dress_overlays.py와 동일한 값 — 원피스 원본이 목선보다 살짝
# 위에서 시작하도록 얹혔으므로, 자를 때도 그만큼 위에서 잘라야 옷깃이 안 잘린다.
WIDTH_CORRECTION_BY_KIND = {"haenam": 0.93}  # normalize_outfits.py와 동일(해남 원피스는 없지만 대비)


def _neck_y_of_base(kind: str) -> int:
    base_path = os.path.join(CHAR_DIR, "base", f"{kind}.png")
    base = np.array(Image.open(base_path).convert("RGBA"))
    mask = base[:, :, 3] > 20
    h, w = mask.shape
    widths = np.zeros(h, dtype=int)
    for y in range(h):
        xs = np.where(mask[y])[0]
        if len(xs):
            widths[y] = xs.max() - xs.min()
    head_max_y = int(np.argmax(widths[: int(h * 0.35)]))
    neck_y = head_max_y + int(np.argmin(widths[head_max_y : int(h * 0.6)]))
    return neck_y


def _largest_component_only(im: Image.Image) -> Image.Image | None:
    arr = np.array(im)
    mask = arr[:, :, 3] > 20
    labeled, n = ndimage.label(mask)
    if n == 0:
        return None
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    largest = int(np.argmax(sizes)) + 1
    keep = labeled == largest
    cleaned = arr.copy()
    cleaned[~keep, 3] = 0
    ys, xs = np.where(keep)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    return Image.fromarray(cleaned).crop((x0, y0, x1 + 1, y1 + 1))


def normalize_neck_down(cropped: Image.Image, out_path: str, width_correction: float = 1.0) -> dict | None:
    trimmed = _largest_component_only(cropped)
    if trimmed is None:
        return None
    tw, th = trimmed.size
    scale = min(TARGET_H / th, MAX_W / tw)
    new_h = max(1, round(th * scale))
    new_w = max(1, round(tw * scale * width_correction))
    resized = trimmed.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (OUTFIT_CANVAS_W, OUTFIT_CANVAS_H), (0, 0, 0, 0))
    px = (OUTFIT_CANVAS_W - new_w) // 2
    canvas.alpha_composite(resized, (px, NECK_Y))
    canvas.save(out_path)
    return {"scale": round(scale, 4), "renderSize": [new_w, new_h]}


def main():
    dress_dir = os.path.join(CHAR_DIR, "dress_full")
    out_dir = os.path.join(CHAR_DIR, "outfit_full")
    files = sorted(glob.glob(os.path.join(dress_dir, "*.png")))

    neck_y_cache: dict[str, int] = {}
    manifest = {}
    for f in files:
        key = os.path.splitext(os.path.basename(f))[0]
        m = re.match(r"^(.*)_dress_", key)
        if not m:
            print(f"  !! kind 패턴을 못 찾음, 건너뜀: {key}")
            continue
        kind = m.group(1)
        if kind not in neck_y_cache:
            neck_y_cache[kind] = _neck_y_of_base(kind)
        neck_y = neck_y_cache[kind]

        im = Image.open(f).convert("RGBA")
        crop_top = max(0, neck_y - NECK_RAISE)
        cropped = im.crop((0, crop_top, im.width, im.height))

        width_correction = WIDTH_CORRECTION_BY_KIND.get(kind, 1.0)
        out_path = os.path.join(out_dir, f"{key}.png")
        info = normalize_neck_down(cropped, out_path, width_correction)
        if info is None:
            print(f"  !! skip {key}: no content after crop")
            continue
        manifest[key] = info
        print(f"  converted {key} (kind={kind}, neck_y={neck_y}): render={info['renderSize']} scale={info['scale']}")

    print(f"\n{len(manifest)}개 dress_full -> outfit_full 변환 완료")


if __name__ == "__main__":
    main()
