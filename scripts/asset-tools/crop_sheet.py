"""사용자가 보내주는 아이템/의상/소품 원본 시트 한 장에서 개별 아이콘을 잘라내는 재사용 도구.

이 세션까지 반복적으로 손으로 짜온 크롭 파이프라인(배경 제거 + bbox 트림 + 라벨 텍스트
제거)을 한 곳에 정리한 것이다. 매번 스크래치패드에 새로 작성하지 않고 이 파일을 import해서
쓴다. 사용 예시는 파일 하단 __main__ 참고.
"""

import numpy as np
from PIL import Image, ImageFilter, ImageDraw


def remove_bg_and_trim(cell: Image.Image, bg_hint=None, pad=3) -> Image.Image:
    """cell 이미지의 테두리 색(또는 bg_hint)을 배경으로 간주해 투명화하고, 내용물 bbox로 자른다."""
    arr = np.array(cell.convert("RGB")).astype(np.int16)
    if bg_hint is not None:
        bg = np.array(bg_hint, dtype=np.int16)
    else:
        border = np.concatenate([
            arr[0:3, :, :].reshape(-1, 3),
            arr[:, 0:3, :].reshape(-1, 3),
            arr[:, -3:, :].reshape(-1, 3),
        ])
        bg = np.median(border, axis=0)

    dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    alpha = np.clip((dist - 20) * 12, 0, 255).astype(np.uint8)

    if cell.mode == "RGBA":
        orig_alpha = np.array(cell)[:, :, 3].astype(np.uint16)
        alpha = (alpha.astype(np.uint16) * orig_alpha // 255).astype(np.uint8)

    out = Image.fromarray(np.dstack([np.array(cell.convert("RGB")), alpha]), mode="RGBA")
    a = out.split()[3].filter(ImageFilter.MedianFilter(3))
    out.putalpha(a)

    bbox = out.getbbox()
    if bbox:
        l, t, r, b = bbox
        l, t = max(0, l - pad), max(0, t - pad)
        r, b = min(out.width, r + pad), min(out.height, b + pad)
        out = out.crop((l, t, r, b))
    return out


def feather_edges(img: Image.Image, edge=20) -> Image.Image:
    """배경이 단색이 아니라 remove_bg_and_trim으로 깔끔히 투명화가 안 될 때(하늘/바다 그라데이션 등),
    가장자리를 부드럽게 페이드시켜 앱의 자체 배경 위에 자연스럽게 얹히도록 한다."""
    img = img.convert("RGBA")
    w, h = img.size
    mask = Image.new("L", (w, h), 255)
    d = ImageDraw.Draw(mask)
    d.rectangle([0, 0, w - 1, edge], fill=0)
    d.rectangle([0, h - 1 - edge, w - 1, h - 1], fill=0)
    d.rectangle([0, 0, edge, h - 1], fill=0)
    d.rectangle([w - 1 - edge, 0, w - 1, h - 1], fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(edge * 0.7))
    img.putalpha(mask)
    return img


def crop_grid(src, out_dir, cells, names, target_px=340, bg_hint=None):
    """src 시트 이미지에서 cells(각 (x0,y0,x1,y1) 픽셀 박스, 라벨 텍스트까지 넉넉히 포함해도 됨은
    금지 — 라벨 없는 순수 이미지 영역만 지정할 것) 순서대로 잘라 out_dir/names[i].png로 저장.
    target_px: 긴 변 기준 리사이즈 목표 픽셀(원본이 더 작으면 그대로 둠)."""
    im = Image.open(src)
    im = im.convert("RGBA" if im.mode == "RGBA" else "RGB")
    for i, box in enumerate(cells):
        cell = im.crop(box)
        trimmed = remove_bg_and_trim(cell, bg_hint=bg_hint)
        if trimmed.width == 0 or trimmed.height == 0:
            print("EMPTY", names[i], box)
            continue
        scale = target_px / max(trimmed.size)
        if scale < 1:
            trimmed = trimmed.resize(
                (max(1, int(trimmed.width * scale)), max(1, int(trimmed.height * scale))),
                Image.LANCZOS,
            )
        trimmed.save(f"{out_dir}/{names[i]}.png")
        print(names[i], trimmed.size)
