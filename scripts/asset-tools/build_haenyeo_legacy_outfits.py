"""MASTER 캔버스 마이그레이션(build_haenyeo_master_canvas.py, 커밋 bdfaeda) 때 옮겨지지
않고 남겨진, outfit_full/haenyeo_outfit_01~20.png(20종)·haenyeo_dress_01~09.png(9종) —
전부 사용자가 이미 GitHub에 올려둔 실제 원화다(design-assets가 아니라 예전 outfit_full
파이프라인 산출물일 뿐, Claude가 새로 그린 그림이 아님) — 를 새 441x906 MASTER 캔버스로
옮겨 haenyeoMasterOutfitSrc()가 다시 찾을 수 있게 한다.

문제: characterFullBody.ts의 HAENYEO_OUTFIT_AVAILABLE_KEYS는 haenyeo_custom_outfit_NN
(2026-09-06 신규 업로드 14종)만 알고 있고, haenyeo_outfit_NN/haenyeo_dress_NN(구버전
번호형 키)은 목록에 없다 — 그런데 itemAppearance.ts의 절반 넘는 SKU(기본 멜빵바지
포함)와 characterPresets.ts의 haenyeoPreset() 기본값이 여전히 이 구버전 키를 참조한다.
그 결과 MASTER 파이프라인 확정 이후로 이 SKU들을 착용한 해녀 캐릭터는 항상 의상 레이어가
생략되고 이너웨어(속옷)만 보이는 채로 렌더링돼왔다(모든 화면 — HaenyeoMasterSprite가
kind="haenyeo"의 유일한 렌더 경로라서 예외 없음).

이 스크립트는 build_haenyeo_master_canvas.py의 remove_skin()을 그대로 재사용해 예전
outfit_full 캔버스(420x512, alpha 상단=NECK_Y=140 — 20+9종 전부 실측 확인)에서 새
MASTER 캔버스(441x906, NECK_Y=503, CENTER_X=219.5)로 등방(가로세로 동일 비율) 스케일 +
목선 정렬 이동만 적용한다(신규 14종 파이프라인과 달리 레이어별 보정 없음 — 여기도 없음).
산출물 파일명은 원래 번호(haenyeo_outfit_NN.png/haenyeo_dress_NN.png)를 그대로 써서
기존 SKU/프리셋 키가 별도 수정 없이 그대로 유효해지도록 한다.

사용법:
    python3 scripts/asset-tools/build_haenyeo_legacy_outfits.py
"""

import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAR_DIR = os.path.join(ROOT, "public", "images", "character")
SRC_DIR = os.path.join(CHAR_DIR, "outfit_full")
OUT_DIR = os.path.join(CHAR_DIR, "master", "haenyeo_outfit")

# build_haenyeo_master_canvas.py와 동일한 상수(재실행해 재계산하지 않고 그 스크립트의
# 산출값을 그대로 고정값으로 씀 — 두 스크립트가 같은 MASTER 캔버스를 다뤄야 하므로 값이
# 달라지면 안 된다. 값의 출처는 build_haenyeo_master_canvas.py의 NECK_Y_BASE=393,
# SOLE_Y_BASE=766, OFFSET_X=42, OFFSET_Y=110, EAR_X_CENTER_BASE=177.5 참고).
CANVAS_W = 441
CANVAS_H = 906
NECK_Y = 393 + 110  # 503
SOLE_Y = 766 + 110  # 876
CENTER_X = 177.5 + 42  # 219.5
TARGET_SPAN = SOLE_Y - NECK_Y  # 373

OLD_CANVAS_W = 420
OLD_NECK_Y = 140

SKIN_REF = np.array([253, 225, 207])
SKIN_DIST_THRESHOLD = 30
SKIN_MIN_COMPONENT_SIZE = 400
SKIN_DILATE_ITER = 2


def remove_skin(im: Image.Image):
    arr = np.array(im.convert("RGBA")).astype(int)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    dist = np.sqrt((r - SKIN_REF[0]) ** 2 + (g - SKIN_REF[1]) ** 2 + (b - SKIN_REF[2]) ** 2)
    candidate = (a > 10) & (dist < SKIN_DIST_THRESHOLD)

    labeled, num = ndimage.label(candidate)
    if num > 0:
        sizes = ndimage.sum(candidate, labeled, range(1, num + 1))
        keep_labels = [i + 1 for i, s in enumerate(sizes) if s > SKIN_MIN_COMPONENT_SIZE]
        skin_mask = np.isin(labeled, keep_labels)
    else:
        skin_mask = candidate

    skin_mask = ndimage.binary_dilation(skin_mask, iterations=SKIN_DILATE_ITER)
    out = arr.copy()
    out[skin_mask, 3] = 0
    return Image.fromarray(out.astype(np.uint8), "RGBA"), int(skin_mask.sum())


def sharpen_alpha(im: Image.Image, threshold: int = 90) -> Image.Image:
    arr = np.array(im).astype(np.float32)
    alpha = arr[:, :, 3]
    scale = 255.0 / max(1, 255 - threshold)
    arr[:, :, 3] = np.clip((alpha - threshold) * scale, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def build_one(name: str):
    src_path = os.path.join(SRC_DIR, f"{name}.png")
    im = Image.open(src_path).convert("RGBA")
    if im.size[0] != OLD_CANVAS_W:
        print(f"  {name}: [수동 확인] 예상 밖 캔버스 폭 {im.size} != {OLD_CANVAS_W} — 건너뜀")
        return None

    no_skin, skin_px = remove_skin(im)
    alpha = np.array(no_skin)[:, :, 3]
    ys = np.where(alpha.max(axis=1) > 20)[0]
    if len(ys) == 0:
        print(f"  {name}: [수동 확인] 스킨 제거 후 알파가 전부 비어있음 — 건너뜀")
        return None
    sole_y = int(ys.max())
    old_span = sole_y - OLD_NECK_Y
    if old_span <= 0:
        print(f"  {name}: [수동 확인] old_span<=0(sole_y={sole_y}) — 건너뜀")
        return None

    scale = TARGET_SPAN / old_span
    new_w = max(1, round(im.width * scale))
    new_h = max(1, round(im.height * scale))
    resized = sharpen_alpha(no_skin.resize((new_w, new_h), Image.LANCZOS), threshold=40)

    paste_x = round(CENTER_X - (OLD_CANVAS_W / 2) * scale)
    paste_y = round(NECK_Y - OLD_NECK_Y * scale)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.alpha_composite(resized, (paste_x, paste_y))

    out_path = os.path.join(OUT_DIR, f"{name}.png")
    canvas.save(out_path)
    print(f"  {name}: scale={scale:.4f} skin_px={skin_px} -> {os.path.relpath(out_path, ROOT)}")
    return out_path


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    names = [f"haenyeo_outfit_{i:02d}" for i in range(1, 21)] + [f"haenyeo_dress_{i:02d}" for i in range(1, 10)]
    ok, failed = [], []
    for name in names:
        result = build_one(name)
        (ok if result else failed).append(name)
    print(f"\n완료: {len(ok)}종 생성, {len(failed)}종 실패/건너뜀")
    if failed:
        print(f"  실패: {', '.join(failed)}")


if __name__ == "__main__":
    main()
