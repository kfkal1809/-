"""꽃다발/낚시 획득물 아이템 아이콘을 원본 참고 시트(public/images/reference-sheets/
sheet-17.png=낚시 획득물, sheet-13.png=본뿌리 꽃)에서 다시 크롭하고, 사각형 배경을
제거해 투명 PNG로 만든다.

배경: 기존 public/images/items/*.png는 "좌표 기반 크롭 + 배경색 거리 기반 투명화"로
이미 한 번 처리됐지만(docs/PROGRESS.md 기록), 크롭 좌표가 부정확해 trash_can/trash_slipper는
옆 칸 물건이 함께 잘려 들어왔고, restore_mailbox는 아예 배경 제거가 안 된 채 남아있는 등
여러 파일에 사각형 배경·이웃 오브젝트 잔여가 남아 있었다. 이 스크립트는 원본 시트에서
각 오브젝트만 정확히 다시 잘라낸 뒤, 네 모서리에서 시작하는 flood-fill로 배경색과
연결된 영역만 투명화한다(오브젝트 내부의 흰색 영역은 모서리와 연결되지 않으므로 보존됨).
가장자리는 알파를 소프트 threshold로 앤티에일리어싱해 톱니 현상을 줄인다.

결과물은 원본을 덮어쓰지 않고 public/images/items_transparent/에 저장한다.

사용법:
    python3 scripts/asset-tools/cutout_fishing_bonppuri_items.py
"""

import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SHEETS = os.path.join(ROOT, "public", "images", "reference-sheets")
OUT_DIR = os.path.join(ROOT, "public", "images", "items_transparent")

# sku -> (sheet 파일, (x0, y0, x1, y1) 크롭 박스).
# 1라운드 크롭은 옆 물건·배너·라벨을 피하는 데만 집중해 오브젝트 자체와 거의 붙어 있었다
# (특히 아래쪽 라벨 박스/텍스트를 피하려고 y1을 너무 타이트하게 잡아, trim_to_content의
# 여백(pad)이 더할 공간이 없어 지느러미·리본 끝·이어폰 줄 같은 부분이 실제로 잘려나감).
# 이번 라운드는 각 행을 넓게 스캔해(배경색 대비 non-background 픽셀 카운트로 배너 끝·
# 라벨 시작·옆 오브젝트 시작 지점을 실측) 오브젝트와 크롭 경계 사이에 실제 여백이 남도록
# 다시 잡았다. sheet-13 본뿌리 열은 아이템 사이 정렬용 점선 가이드라인이 있었는데, 이번엔
# 그 가이드라인이 걸리는 정확한 폭(두 개의 간격 사이 좁은 non-background 구간)을 찾아
# 그 안쪽으로 경계를 잡아 애초에 크롭에 안 걸리게 했다(예전처럼 MANUAL_CLEAR_RECTS로
# 사후 제거할 필요가 없어짐).
CROPS = {
    # sheet-17: 낚시하면 건져지는 것 — 물고기
    "fish_mackerel": ("sheet-17.png", (34, 272, 299, 391)),
    "fish_squid": ("sheet-17.png", (299, 253, 456, 392)),
    "fish_tuna": ("sheet-17.png", (456, 250, 701, 391)),
    "fish_octopus": ("sheet-17.png", (701, 250, 880, 392)),
    "fish_pufferfish": ("sheet-17.png", (880, 250, 1065, 392)),
    # 해남이 분실물
    "lost_old_phone": ("sheet-17.png", (35, 496, 205, 641)),
    "lost_glove": ("sheet-17.png", (205, 474, 395, 641)),
    "lost_notebook": ("sheet-17.png", (395, 470, 572, 641)),
    "lost_earphone": ("sheet-17.png", (572, 470, 727, 641)),
    "lost_leave_form": ("sheet-17.png", (727, 470, 913, 641)),
    "lost_photo": ("sheet-17.png", (913, 470, 1078, 641)),
    # 쓰레기
    "trash_boots": ("sheet-17.png", (95, 725, 286, 836)),
    "trash_tire": ("sheet-17.png", (286, 710, 497, 836)),
    "trash_can": ("sheet-17.png", (497, 710, 650, 836)),
    "trash_slipper": ("sheet-17.png", (650, 710, 841, 836)),
    "trash_sock": ("sheet-17.png", (841, 710, 985, 836)),
    # 복원 가능 아이템
    "restore_radio": ("sheet-17.png", (32, 918, 291, 1032)),
    "restore_camera": ("sheet-17.png", (291, 918, 482, 1032)),
    "restore_frame": ("sheet-17.png", (482, 918, 657, 1032)),
    "restore_ship_model": ("sheet-17.png", (657, 918, 877, 1032)),
    "restore_mailbox": ("sheet-17.png", (877, 918, 1075, 1032)),
    # 전설 아이템
    "legend_flight_ticket": ("sheet-17.png", (32, 1136, 295, 1193)),
    "legend_soon_note": ("sheet-17.png", (295, 1122, 482, 1193)),
    "legend_compass": ("sheet-17.png", (482, 1122, 651, 1193)),
    "legend_golden_anchor": ("sheet-17.png", (651, 1122, 833, 1193)),
    "legend_shell_jewel": ("sheet-17.png", (833, 1122, 1075, 1193)),
    # sheet-13: 선실 장식 컬렉션 — 맨 위 "본뿌리 꽃장식" 7종
    "bonppuri_season_bouquet": ("sheet-13.png", (18, 286, 197, 440)),
    "bonppuri_peony_bouquet": ("sheet-13.png", (200, 286, 366, 440)),
    "bonppuri_mini_vase": ("sheet-13.png", (369, 268, 513, 440)),
    "bonppuri_peony_vase": ("sheet-13.png", (515, 268, 654, 440)),
    "bonppuri_wedding_bouquet": ("sheet-13.png", (657, 268, 790, 440)),
    "bonppuri_premium_bouquet": ("sheet-13.png", (793, 268, 932, 440)),
    "bonppuri_season_deco": ("sheet-13.png", (935, 268, 1100, 440)),
}

# 오브젝트가 옆 칸 헤더 배너/장식과 실제로 맞닿아 있어(사각형 크롭만으로는 분리 불가능)
# 배경색 거리 기반 flood-fill로는 못 지우는 잔여 조각이 남는 케이스가 있다면, 크롭 좌표로
# 해결이 안 돼 배경이 아닌 "이웃 장식 조각"임을 육안으로 직접 확인하고, 크롭 박스 기준
# 상대좌표로 그 조각만 강제 투명화한다(오브젝트 본체는 전혀 건드리지 않음).
# sku -> [(x0, y0, x1, y1), ...] (크롭 좌상단 기준 상대좌표)
MANUAL_CLEAR_RECTS: dict[str, list[tuple[int, int, int, int]]] = {
    # "물고기" 섹션 배너의 오른쪽 아래 모서리가 고등어 크롭 왼쪽 위 구석에 대각선으로
    # 걸린다(배너가 파란색이라 배경색 거리 기반 제거로는 못 지움 — 육안 확인 후 좌표
    # 지정). 고등어 등지느러미는 x=114부터 시작해 전혀 겹치지 않는다.
    "fish_mackerel": [(0, 0, 110, 12)],
    # "복원 가능 아이템" 섹션 배너가 라디오 크롭 위쪽을 폭 넓게 가로지른다(배너가 붉은
    # 계열이라 배경색 거리 기반 제거로는 못 지움 — 육안 확인 후 좌표 지정). 라디오 안테나는
    # y=22 아래부터 시작해 겹치지 않는다.
    "restore_radio": [(0, 0, 195, 22), (190, 0, 254, 16)],
    # "쓰레기" 섹션 배너의 휴지통 아이콘이 장화 크롭 왼쪽 위 구석에 살짝 걸친다(장화
    # 뒤축이 배너 바로 아래까지 닿아 있어 크롭 좌표만으로는 완전히 못 피함).
    "trash_boots": [(0, 0, 175, 21)],
    # "해남이 분실물" 섹션 배너 꼬리가 장갑/휴대폰 크롭 왼쪽 위 구석에 걸친다.
    "lost_glove": [(0, 0, 90, 7)],
    "lost_old_phone": [(0, 0, 100, 6)],
    # sheet-13 본뿌리 꽃장식 아이템 사이 정렬용 옅은 하늘색 점선 가이드라인의 잔여
    # 조각이 시즌 부케·장미 꽃다발 크롭 왼쪽 끝에 남는다(부케 본체와는 육안으로 확인한
    # 뚜렷한 여백이 있어 겹치지 않음).
    "bonppuri_season_bouquet": [(0, 0, 4, 142)],
    "bonppuri_peony_bouquet": [(0, 0, 2, 142)],
}


def flood_fill_bg_remove(im: Image.Image, tol: int = 34, feather: bool = True) -> Image.Image:
    """네 모서리(배경 확정 영역)에서 시작해 색이 비슷하게 이어진 영역만 투명화한다.
    오브젝트 내부의 흰색/밝은 영역은 모서리와 연결이 끊겨 있으므로 안 지워진다."""
    arr = np.array(im.convert("RGBA")).astype(int)
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3]

    # 배경색은 모서리 4점이 아니라 가장자리 3px 테두리 전체에서 최빈값(양자화 후)으로
    # 추정한다 — 모서리 한 곳이 우연히 그림자·질감 위에 걸리면(오브젝트가 크롭 경계에
    # 바짝 붙은 경우) 4점 중앙값이 실제 배경색에서 크게 벗어나 배경 전체가 안 지워지는
    # 사고가 났다(fish_mackerel에서 실제로 발생, 재현 확인).
    border = np.concatenate([rgb[:3, :].reshape(-1, 3), rgb[-3:, :].reshape(-1, 3), rgb[:, :3].reshape(-1, 3), rgb[:, -3:].reshape(-1, 3)])
    quantized = (border // 8 * 8)
    uniq, counts = np.unique(quantized, axis=0, return_counts=True)
    mode_bucket = uniq[np.argmax(counts)]
    in_bucket = np.all(np.abs(border - mode_bucket) < 8, axis=1)
    bg_color = border[in_bucket].mean(axis=0)

    diff = np.abs(rgb - bg_color).sum(axis=2)
    bg_like = diff < tol

    # 모서리 4점에서 flood-fill(4방향 연결)로 "배경과 실제로 이어진" 픽셀만 골라낸다.
    labeled, _ = ndimage.label(bg_like, structure=np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]]))
    bg_labels = {labeled[0, 0], labeled[0, w - 1], labeled[h - 1, 0], labeled[h - 1, w - 1]}
    bg_labels.discard(0)
    bg_mask = np.isin(labeled, list(bg_labels))

    alpha = np.where(bg_mask, 0, 255).astype(np.uint8)

    if feather:
        # 배경-오브젝트 경계 근방만 부드럽게(가우시안) 앤티에일리어싱 — 톱니 방지.
        dist_in = ndimage.distance_transform_edt(~bg_mask)
        dist_out = ndimage.distance_transform_edt(bg_mask)
        soft = np.where(bg_mask, np.clip(128 - dist_out * 90, 0, 128), np.clip(128 + dist_in * 90, 128, 255))
        band = (dist_in <= 2) | (dist_out <= 2)
        alpha = np.where(band, soft, alpha).astype(np.uint8)

    out = arr.copy()
    out[:, :, 3] = alpha
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def despeckle(im: Image.Image, min_size: int = 13) -> Image.Image:
    """원본 시트의 종이 질감 노이즈 때문에 flood-fill 배경 제거 후에도 오브젝트 본체와
    전혀 연결되지 않은 1~8px짜리 미세한 얼룩(거의 배경색과 같지만 근소하게 달라 임계값을
    살짝 넘은 픽셀)이 드문드문 남는 경우가 있다. 실제 오브젝트의 가장 작은 독립 요소도
    16px 이상(legend_flight_ticket의 점선 티켓 테두리 조각으로 실측 확인)이라, 13px
    미만의 고립된 덩어리만 안전하게 지워도 오브젝트 디테일은 전혀 손실되지 않는다(대각선
    연결까지 포함해 얼룩끼리 뭉치면 10px를 살짝 넘는 경우가 있어 여유를 좀 더 뒀다)."""
    arr = np.array(im)
    mask = arr[:, :, 3] > 10
    labeled, n = ndimage.label(mask, structure=np.array([[1, 1, 1], [1, 1, 1], [1, 1, 1]]))
    if n <= 1:
        return im
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    small_labels = [i + 1 for i, s in enumerate(sizes) if s < min_size]
    if not small_labels:
        return im
    out = arr.copy()
    out[np.isin(labeled, small_labels), 3] = 0
    return Image.fromarray(out, "RGBA")


def trim_to_content(im: Image.Image, pad: int = 8) -> Image.Image:
    arr = np.array(im)
    mask = arr[:, :, 3] > 10
    ys, xs = np.where(mask)
    if len(ys) == 0:
        return im
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    y0 = max(0, y0 - pad)
    x0 = max(0, x0 - pad)
    y1 = min(im.height, y1 + pad + 1)
    x1 = min(im.width, x1 + pad + 1)
    return im.crop((x0, y0, x1, y1))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    sheet_cache: dict[str, Image.Image] = {}
    for sku, (sheet_name, box) in CROPS.items():
        if sheet_name not in sheet_cache:
            sheet_cache[sheet_name] = Image.open(os.path.join(SHEETS, sheet_name)).convert("RGB")
        sheet = sheet_cache[sheet_name]
        crop = sheet.crop(box)
        cutout = flood_fill_bg_remove(crop)
        for rx0, ry0, rx1, ry1 in MANUAL_CLEAR_RECTS.get(sku, []):
            arr = np.array(cutout)
            arr[ry0:ry1, rx0:rx1, 3] = 0
            cutout = Image.fromarray(arr, "RGBA")
        cutout = despeckle(cutout)
        trimmed = trim_to_content(cutout)
        out_path = os.path.join(OUT_DIR, f"{sku}.png")
        trimmed.save(out_path)
        print(f"  {sku}: crop={box} -> {trimmed.size}")
    print(f"\n{len(CROPS)}개 저장 완료 -> {OUT_DIR}")


if __name__ == "__main__":
    main()
