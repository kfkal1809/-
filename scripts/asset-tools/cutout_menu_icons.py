"""장소 메뉴/하단탭 아이콘(public/images/icons/*.png)이 원본 스펙 시트
(public/images/misc/icon-sheet-source.png)의 각 카드에서 잘릴 때 여백이 부족해,
하트·반짝임·체크마크 같은 장식이 카드(=크롭) 경계에서 사각형으로 잘려 있었다.
이 스크립트는 스펙 시트에서 각 아이콘 카드를 다시 여유 있게 크롭하고(라벨 텍스트는
제외), 카드의 크림색 배경만 제거해 투명 PNG로 만들어 public/images/icons/에 저장한다
(장식이 카드 경계에 닿지 않을 만큼 넉넉히 잘라 실루엣을 따라 정교하게 남긴다).

배경 제거는 두 가지 방식을 쓴다:
  - 기본: 네 모서리에서 시작하는 flood-fill. 오브젝트 내부의 흰색/크림색 영역
    (예: book의 책장, chef의 흰 모자)은 모서리와 연결이 끊겨 있어 보존된다.
  - PLAIN_THRESHOLD_ICONS: fishing(낚싯줄이 카드 위쪽 구석을 막아 배경 한 조각이
    모서리와 완전히 단절됨), ring(반지 가운데 구멍 자체가 모서리와 단절된 배경
    영역이라 뚫려야 함) 두 아이콘은 내부에 보존해야 할 흰색 오브젝트 부분이 없어,
    연결성을 따지지 않고 배경색과 가까운 픽셀을 전부 투명화해도 안전하다 — 이렇게
    해야 낚싯줄에 둘러싸여 고립된 배경 조각이나 반지 구멍이 제대로 뚫린다.

사용법:
    python3 scripts/asset-tools/cutout_menu_icons.py
"""

import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SHEET = os.path.join(ROOT, "public", "images", "misc", "icon-sheet-source.png")
OUT_DIR = os.path.join(ROOT, "public", "images", "icons")

# icon name -> (카드 박스(x0,y0,x1,y1), 라벨 텍스트 시작 지점까지의 카드 높이 비율,
#               라벨 위 여유 여백으로 추가로 뺄 px)
# 비율/여백 모두 각 카드를 확대해 라벨이 실제로 시작하는 지점을 육안으로 잰 값이다.
CARDS: dict[str, tuple[tuple[int, int, int, int], float, int]] = {
    "home": ((44, 157, 327, 358), 0.70, 14),
    "cabin": ((340, 157, 615, 358), 0.70, 14),
    "bag": ((917, 157, 1190, 358), 0.692, 10),
    "menu": ((44, 372, 327, 579), 0.70, 14),
    "clipboard": ((340, 372, 615, 579), 0.739, 14),
    "fishing": ((628, 373, 905, 579), 0.748, 34),
    "chef": ((917, 373, 1190, 579), 0.68, 14),
    "flower": ((45, 592, 328, 814), 0.64, 8),
    "gopchang": ((341, 593, 616, 815), 0.721, 14),
    "company": ((629, 593, 905, 816), 0.735, 14),
    "trophy": ((917, 593, 1191, 816), 0.731, 14),
    "anchor": ((46, 829, 330, 1053), 0.75, 10),
    "bell": ((342, 830, 618, 1054), 0.68, 14),
    "coin": ((630, 831, 907, 1054), 0.68, 14),
    "ring": ((47, 1066, 331, 1258), 0.70, 14),
    "book": ((344, 1067, 619, 1259), 0.70, 14),
    "hanger": ((632, 1068, 908, 1260), 0.755, 14),
}

# 내부에 보존해야 할 흰색/크림색 오브젝트 부분이 없는 아이콘 — 모서리 연결성을 따지지
# 않고 배경색과 가까운 픽셀을 전부 지운다(위 docstring 참고).
PLAIN_THRESHOLD_ICONS = {"fishing", "ring"}

CARD_MARGIN = 12  # 카드 안쪽 대시 테두리를 피하기 위해 사방으로 미리 빼는 여백


def estimate_bg_color(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[:3, :].reshape(-1, 3), rgb[-3:, :].reshape(-1, 3), rgb[:, :3].reshape(-1, 3), rgb[:, -3:].reshape(-1, 3)])
    quantized = border // 8 * 8
    uniq, counts = np.unique(quantized, axis=0, return_counts=True)
    mode_bucket = uniq[np.argmax(counts)]
    in_bucket = np.all(np.abs(border - mode_bucket) < 8, axis=1)
    return border[in_bucket].mean(axis=0)


def soft_alpha(bg_mask: np.ndarray) -> np.ndarray:
    alpha = np.where(bg_mask, 0, 255).astype(np.uint8)
    dist_in = ndimage.distance_transform_edt(~bg_mask)
    dist_out = ndimage.distance_transform_edt(bg_mask)
    soft = np.where(bg_mask, np.clip(128 - dist_out * 90, 0, 128), np.clip(128 + dist_in * 90, 128, 255))
    band = (dist_in <= 2) | (dist_out <= 2)
    return np.where(band, soft, alpha).astype(np.uint8)


def remove_bg(crop: np.ndarray, plain: bool, tol: int = 40) -> np.ndarray:
    rgb = crop.astype(int)
    h, w, _ = rgb.shape
    bg_color = estimate_bg_color(rgb)
    diff = np.abs(rgb - bg_color).sum(axis=2)
    bg_like = diff < tol

    if plain:
        bg_mask = bg_like
    else:
        labeled, _ = ndimage.label(bg_like, structure=np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]]))
        bg_labels = {labeled[0, 0], labeled[0, w - 1], labeled[h - 1, 0], labeled[h - 1, w - 1]}
        bg_labels.discard(0)
        bg_mask = np.isin(labeled, list(bg_labels))

    alpha = soft_alpha(bg_mask)
    return np.dstack([crop, alpha])


def despeckle(rgba: np.ndarray, min_size: int = 13) -> np.ndarray:
    """스캔 원본의 종이 질감 노이즈로 남는, 오브젝트 본체와 연결되지 않은 3~10px짜리
    고립된 얼룩을 지운다. 가장 작은 정상 디테일(예: 하트 끝 뾰족한 점)도 13px보다는
    커서, 이 임계값 미만만 지워도 실제 디테일 손실은 없다(대각선 연결까지 포함해
    얼룩끼리 뭉치면 10px를 살짝 넘는 경우가 있어 여유를 뒀다)."""
    mask = rgba[:, :, 3] > 10
    labeled, n = ndimage.label(mask, structure=np.array([[1, 1, 1], [1, 1, 1], [1, 1, 1]]))
    if n <= 1:
        return rgba
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    small_labels = [i + 1 for i, s in enumerate(sizes) if s < min_size]
    if not small_labels:
        return rgba
    out = rgba.copy()
    out[np.isin(labeled, small_labels), 3] = 0
    return out


def trim(rgba: np.ndarray, pad: int = 10) -> np.ndarray:
    mask = rgba[:, :, 3] > 10
    ys, xs = np.where(mask)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    y0 = max(0, y0 - pad)
    x0 = max(0, x0 - pad)
    y1 = min(rgba.shape[0], y1 + pad + 1)
    x1 = min(rgba.shape[1], x1 + pad + 1)
    return rgba[y0:y1, x0:x1]


def main():
    sheet = np.array(Image.open(SHEET).convert("RGB"))
    for name, ((x0, y0, x1, y1), ratio, extra_trim) in CARDS.items():
        h = y1 - y0
        cut_y = y0 + int(h * ratio) - extra_trim
        crop = sheet[y0 + CARD_MARGIN : cut_y, x0 + CARD_MARGIN : x1 - CARD_MARGIN]
        rgba = remove_bg(crop, plain=name in PLAIN_THRESHOLD_ICONS)
        rgba = despeckle(rgba)
        rgba = trim(rgba)
        out_path = os.path.join(OUT_DIR, f"{name}.png")
        Image.fromarray(rgba.astype(np.uint8), "RGBA").save(out_path)
        print(f"  {name}: {rgba.shape[1]}x{rgba.shape[0]}")
    print(f"\n{len(CARDS)}개 아이콘 저장 완료 -> {OUT_DIR}")


if __name__ == "__main__":
    main()
