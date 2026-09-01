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

# sku -> (sheet 파일, (x0, y0, x1, y1) 크롭 박스, 넉넉한 여백 포함 — flood-fill이 나머지 정리)
CROPS = {
    # sheet-17: 낚시하면 건져지는 것
    "fish_mackerel": ("sheet-17.png", (30, 282, 300, 385)),
    "fish_squid": ("sheet-17.png", (300, 258, 470, 385)),
    "fish_tuna": ("sheet-17.png", (455, 258, 705, 385)),
    "fish_octopus": ("sheet-17.png", (690, 258, 875, 385)),
    "fish_pufferfish": ("sheet-17.png", (875, 258, 1065, 385)),
    "lost_old_phone": ("sheet-17.png", (30, 503, 210, 615)),
    "lost_glove": ("sheet-17.png", (225, 503, 385, 615)),
    "lost_notebook": ("sheet-17.png", (395, 503, 585, 615)),
    "lost_earphone": ("sheet-17.png", (585, 503, 725, 610)),
    "lost_leave_form": ("sheet-17.png", (730, 503, 915, 615)),
    "lost_photo": ("sheet-17.png", (910, 503, 1080, 610)),
    "trash_boots": ("sheet-17.png", (100, 731, 270, 840)),
    "trash_tire": ("sheet-17.png", (305, 731, 475, 840)),
    "trash_can": ("sheet-17.png", (500, 731, 650, 843)),
    "trash_slipper": ("sheet-17.png", (655, 731, 845, 843)),
    "trash_sock": ("sheet-17.png", (840, 731, 985, 843)),
    "restore_radio": ("sheet-17.png", (20, 943, 255, 1024)),
    "restore_camera": ("sheet-17.png", (300, 943, 475, 1024)),
    "restore_frame": ("sheet-17.png", (500, 943, 650, 1024)),
    "restore_ship_model": ("sheet-17.png", (665, 943, 860, 1024)),
    "restore_mailbox": ("sheet-17.png", (880, 943, 1055, 1024)),
    "legend_flight_ticket": ("sheet-17.png", (15, 1150, 250, 1216)),
    "legend_soon_note": ("sheet-17.png", (260, 1150, 475, 1216)),
    "legend_compass": ("sheet-17.png", (490, 1150, 660, 1216)),
    "legend_golden_anchor": ("sheet-17.png", (660, 1150, 835, 1216)),
    "legend_shell_jewel": ("sheet-17.png", (840, 1150, 1060, 1216)),
    # sheet-13: 선실 장식 컬렉션 — 맨 위 "본뿌리 꽃장식" 7종
    "bonppuri_season_bouquet": ("sheet-13.png", (30, 286, 190, 392)),
    "bonppuri_peony_bouquet": ("sheet-13.png", (190, 286, 350, 392)),
    "bonppuri_mini_vase": ("sheet-13.png", (355, 268, 495, 392)),
    "bonppuri_peony_vase": ("sheet-13.png", (500, 268, 650, 392)),
    "bonppuri_wedding_bouquet": ("sheet-13.png", (655, 268, 795, 392)),
    "bonppuri_premium_bouquet": ("sheet-13.png", (800, 268, 940, 392)),
    "bonppuri_season_deco": ("sheet-13.png", (945, 268, 1090, 392)),
}

# 오브젝트가 옆 칸 헤더 배너/장식과 실제로 맞닿아 있어(사각형 크롭만으로는 분리 불가능)
# 배경색 거리 기반 flood-fill로는 못 지우는 잔여 조각이 남는 케이스가 있다면, 크롭 좌표로
# 해결이 안 돼 배경이 아닌 "이웃 장식 조각"임을 육안으로 직접 확인하고, 크롭 박스 기준
# 상대좌표로 그 조각만 강제 투명화한다(오브젝트 본체는 전혀 건드리지 않음). 현재는 전부
# 크롭 좌표 조정만으로 해결돼 실제로 쓰는 항목은 없다.
# sku -> [(x0, y0, x1, y1), ...] (크롭 좌상단 기준 상대좌표)
MANUAL_CLEAR_RECTS: dict[str, list[tuple[int, int, int, int]]] = {
    # "쓰레기" 섹션 헤더 배너의 삐죽삐죽한 아래쪽 끝 일부가 장화 크롭 좌상단에 살짝 걸친다
    # (배너 자체가 파란색이라 배경색 거리 기반 제거로는 못 지움 — 육안 확인 후 좌표 지정).
    "trash_boots": [(0, 0, 90, 14)],
    # "복원 가능 아이템" 섹션 왼쪽 테두리(핑크 점선)가 라디오 크롭 왼쪽 끝에 살짝 걸친다.
    "restore_radio": [(0, 0, 14, 91)],
    # "본뿌리 꽃장식" 섹션 헤더 배너 모서리에서 이어지는 살구색 곡선 장식선이 시즌 부케
    # 크롭 왼쪽 끝을 세로로 관통한다(배경색과 다른 색이라 flood-fill로 못 지움). 부케
    # 본체는 x=14부터 시작해(육안 확인) 전혀 겹치지 않으므로 왼쪽 8px 전체 폭을 지운다.
    "bonppuri_season_bouquet": [(0, 0, 8, 106)],
    # sheet-13 본뿌리 꽃장식 7종 사이사이에는 디자이너가 정렬용으로 남긴 옅은 하늘색
    # 점선 세로 가이드라인이 있다(배경 크림색과 색 거리가 애매해 flood-fill로 완전히
    # 안 지워지고 흐릿한 흰 잔상으로 남음). 각 아이템 본체와는 픽셀 단위로 뚜렷한
    # 여백(투명 갭)이 있는 걸 육안으로 확인했으므로, 가이드라인이 걸친 폭만 지운다.
    "bonppuri_peony_bouquet": [(0, 0, 12, 106)],
    "bonppuri_mini_vase": [(0, 0, 16, 124)],
    "bonppuri_peony_vase": [(0, 0, 20, 124)],
    "bonppuri_wedding_bouquet": [(0, 0, 4, 124), (133, 0, 140, 124)],
    "bonppuri_premium_bouquet": [(130, 0, 140, 124)],
    "bonppuri_season_deco": [(133, 0, 145, 124)],
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
