"""캐릭터 "목 아래 전신 의상" 스프라이트 정규화 파이프라인.

앞으로 새 의상 원본 PNG(알파 배경, 목~신발까지 한 장에 그려진 형태)를
public/images/character/{haenyeo,haenam,child}/outfit/ 아래에 추가하고 이 스크립트를
다시 실행하면(그 폴더 전체를 다시 스캔해 outfit_full/에 재생성하는 방식이라 멱등함),
바로 게임에서 outfitAssetKey로 쓸 수 있는 정규화된 스프라이트가 생긴다.

왜 이 방식인가(배경): 원본 의상 90장은 얼굴 자리만 빈 "목 아래 전신 인형" 구도로 그려져
있어서, 기존 기본 체형(팔다리가 있는 전신 일러스트) 위에 그대로 얹으면 팔다리가 이중으로
겹치고 얼굴이 가려지는 문제가 있었다. 그래서 기본 체형의 "목 위(얼굴+헤어)"만 고정 레이어로
쓰고, 목 아래는 의상 원본을 그대로(체형+옷을 한 장으로) 정규화해서 통째로 갈아 끼운다.
두 레이어의 이음매가 항상 맞으려면 모든 의상이 같은 캔버스 크기, 같은 목선(NECK_Y) 좌표에
와야 하는데, 그걸 사람이 의상마다 손으로 맞추지 않고 이 스크립트가 자동으로 한다:
알파 bbox로 트림 → 가장 큰 connected component만 남겨 라벨/번호뱃지 같은 잡음 제거 →
목표 높이/폭에 맞춰 비율 유지 스케일 → 캔버스에 목선 좌표로 위치 고정.

사용법:
    python3 scripts/asset-tools/normalize_outfits.py

이 스크립트가 하는 일:
  1. public/images/character/base/*.png(기본 체형 8종)에서 목선을 자동 검출해
     머리(얼굴+헤어)만 public/images/character/base/head/*.png로 크롭.
  2. public/images/character/{haenyeo,haenam,child}/outfit/*.png 전체를
     public/images/character/outfit_full/*.png로 정규화.
  3. lib/domain/itemAppearance.ts에서 아직 outfitAssetKey로 안 쓰이고 있는 새
     outfit_full 키가 있으면 목록으로 출력한다(= 게임에 새로 등록해서 연결해야 할 항목).
     SKU 이름/가격/어느 슬롯에 넣을지는 게임 기획 판단이라 자동화하지 않음 — 이 목록을 보고
     lib/domain/itemAppearance.ts의 ITEM_APPEARANCE_PATCH에 한 줄 추가하면 끝.

CharacterSprite가 참조하는 상수(캔버스 크기, 목선 좌표 등)는 반드시
lib/domain/characterFullBody.ts와 값이 같아야 한다 — 이 파일 하나만 수정해서 어긋나는
일이 없도록, 상수를 바꿀 경우 두 파일 모두 같이 고칠 것.
"""

import glob
import json
import os
import re

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAR_DIR = os.path.join(ROOT, "public", "images", "character")

# lib/domain/characterFullBody.ts와 반드시 동일해야 하는 값들.
OUTFIT_CANVAS_W = 420
OUTFIT_CANVAS_H = 512
NECK_Y = 140
TARGET_H = 350
MAX_W = 380
HEAD_NECK_MARGIN = 14  # 머리 크롭 시 목선 아래로 살짝 여유(옷깃 밑에 자연스럽게 겹치도록)

# 원본 의상 시트마다 그려진 체형 비율(어깨-머리 비)이 조금씩 다르다. 해녀 원본은 머리 폭
# 190px 기준 어깨폭이 ~0.89배로 자연스럽게 나오는데, 해남 원본은 같은 방식으로 정규화하면
# ~0.94~1.0배로 나와 상체가 머리에 비해 두툼해 보인다(실측: haenam_deck_outfit_04, 0.947 /
# haenam_engine_outfit_01, 0.942 vs 해녀 평균 0.89). 목선(NECK_Y) 앵커와 발 위치(높이 스케일)는
# 그대로 두고 "가로 폭만" 살짝 더 좁혀서 해녀와 같은 세계관 비율로 맞춘다 — 키/목선 위치는
# 안 바뀌므로 이음매나 발 기준선은 그대로 유지된다.
WIDTH_CORRECTION_BY_KIND = {
    "haenam": 0.93,
}


def _width_profile(mask: np.ndarray) -> np.ndarray:
    h, _ = mask.shape
    widths = np.zeros(h, dtype=int)
    for y in range(h):
        xs = np.where(mask[y])[0]
        if len(xs):
            widths[y] = xs.max() - xs.min()
    return widths


def _find_neck_y(mask: np.ndarray) -> int:
    """머리 최대폭 지점 이후, 어깨가 벌어지기 전의 최소폭 지점을 목선으로 추정."""
    widths = _width_profile(mask)
    h = len(widths)
    head_max_y = int(np.argmax(widths[: int(h * 0.35)]))
    search_end = int(h * 0.6)
    seg = widths[head_max_y:search_end]
    return head_max_y + int(np.argmin(seg))


def crop_heads() -> dict:
    out_dir = os.path.join(CHAR_DIR, "base", "head")
    os.makedirs(out_dir, exist_ok=True)
    sizes = {}
    for path in sorted(glob.glob(os.path.join(CHAR_DIR, "base", "*.png"))):
        key = os.path.splitext(os.path.basename(path))[0]
        im = Image.open(path).convert("RGBA")
        arr = np.array(im)
        mask = arr[:, :, 3] > 20
        neck_y = _find_neck_y(mask)
        crop_bottom = min(im.height, neck_y + HEAD_NECK_MARGIN)
        ys, xs = np.where(mask[:crop_bottom])
        x0, x1 = xs.min(), xs.max()
        head = im.crop((x0, 0, x1 + 1, crop_bottom))
        head.save(os.path.join(out_dir, f"{key}.png"))
        sizes[key] = {"w": head.width, "h": head.height}
        print(f"  head {key}: {head.size} (neck_y={neck_y})")
    return sizes


def normalize_outfit(path: str, out_path: str, width_correction: float = 1.0) -> dict | None:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    mask = arr[:, :, 3] > 20
    labeled, n = ndimage.label(mask)
    if n == 0:
        return None
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    largest = int(np.argmax(sizes)) + 1
    keep_mask = labeled == largest
    ys, xs = np.where(keep_mask)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()

    # 가장 큰 덩어리(=의상 본체) 바깥은 라벨/번호뱃지 같은 잡음으로 보고 지운다.
    cleaned = arr.copy()
    cleaned[~keep_mask, 3] = 0
    trimmed = Image.fromarray(cleaned).crop((x0, y0, x1 + 1, y1 + 1))

    tw, th = trimmed.size
    scale = min(TARGET_H / th, MAX_W / tw)
    # 높이 스케일(목선~발 기준선)은 그대로 두고, 가로 폭에만 보정치를 적용해 어깨가 머리에
    # 비해 과하게 넓어 보이는 걸 줄인다 — width_correction=1.0이면 기존과 동일(균등 스케일).
    new_h = max(1, round(th * scale))
    new_w = max(1, round(tw * scale * width_correction))
    resized = trimmed.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (OUTFIT_CANVAS_W, OUTFIT_CANVAS_H), (0, 0, 0, 0))
    px = (OUTFIT_CANVAS_W - new_w) // 2
    canvas.alpha_composite(resized, (px, NECK_Y))
    canvas.save(out_path)
    return {"scale": round(scale, 4), "widthCorrection": width_correction, "renderSize": [new_w, new_h]}


def normalize_all_outfits() -> dict:
    out_dir = os.path.join(CHAR_DIR, "outfit_full")
    os.makedirs(out_dir, exist_ok=True)
    manifest = {}
    files = sorted(glob.glob(os.path.join(CHAR_DIR, "*", "outfit", "*.png")))
    for f in files:
        key = os.path.splitext(os.path.basename(f))[0]
        kind = os.path.basename(os.path.dirname(os.path.dirname(f)))  # .../<kind>/outfit/<file>.png
        width_correction = WIDTH_CORRECTION_BY_KIND.get(kind, 1.0)
        out_path = os.path.join(out_dir, f"{key}.png")
        info = normalize_outfit(f, out_path, width_correction)
        if info is None:
            print(f"  !! skip {key}: no content")
            continue
        manifest[key] = info
        print(f"  outfit {key}: render={info['renderSize']} scale={info['scale']}")
    return manifest


def report_unregistered_keys(manifest: dict) -> None:
    """정규화는 됐지만 itemAppearance.ts 어디서도 outfitAssetKey로 안 쓰이는 키를 알려준다."""
    item_appearance_path = os.path.join(ROOT, "lib", "domain", "itemAppearance.ts")
    with open(item_appearance_path, encoding="utf-8") as f:
        content = f.read()
    referenced = set(re.findall(r'outfitAssetKey:\s*"([^"]+)"', content))
    unregistered = sorted(set(manifest) - referenced)
    if unregistered:
        print("\n다음 정규화된 의상은 아직 어떤 아이템 SKU에도 연결되어 있지 않습니다")
        print("(lib/domain/itemAppearance.ts의 ITEM_APPEARANCE_PATCH에 outfitAssetKey로 추가하세요):")
        for k in unregistered:
            print(f"  - {k}")
    else:
        print("\n모든 정규화된 의상이 itemAppearance.ts에 연결되어 있습니다.")


if __name__ == "__main__":
    print("1) 기본 체형 8종에서 머리(얼굴+헤어) 크롭 중...")
    head_sizes = crop_heads()

    print("\n2) 의상 에셋 정규화 중...")
    outfit_manifest = normalize_all_outfits()

    manifest_path = os.path.join(os.path.dirname(__file__), "normalize_outfits_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({"heads": head_sizes, "outfits": outfit_manifest}, f, indent=2, ensure_ascii=False)
    print(f"\n매니페스트 저장: {manifest_path}")

    report_unregistered_keys(outfit_manifest)
