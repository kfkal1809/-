"""새싹(아동) outfit_full/*.png 91종의 목선(y=140, NECK_Y)~발끝 세로 길이를 실측해,
"아기 멜빵바지"(child_outfit_02.png, 기본 지급 아이템) 대비 스케일 배율표를 만든다.

배경: 모든 outfit_full은 같은 캔버스(420x512)에 목선이 항상 NECK_Y(140)에 오도록
저장돼 있지만(정렬 자체는 맞음), 목선부터 발끝까지 그려진 실제 체형 길이는 그림마다
279~349px로 최대 25%까지 달랐다 — 옷을 갈아입힐 때마다 같은 새싹인데 키가 늘었다
줄었다 하는 원인. 그림을 다시 그리거나 자르지 않고, lib/domain/characterFullBody.ts의
CHILD_OUTFIT_BODY_SCALE_Y 표로 만들어 CharacterSprite가 렌더링 시 목선을 축으로
CSS transform: scaleY만 적용해 보정한다.

사용법(결과를 다시 뽑아 표를 갱신하고 싶을 때):
    cd public/images/character/outfit_full
    python3 ../../../../scripts/asset-tools/measure_child_outfit_scale.py
"""

import glob

import numpy as np
from PIL import Image

REF_KEY = "child_outfit_02"  # 아기 멜빵바지


def measure(path: str) -> tuple[int, int] | None:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    mask = arr[:, :, 3] > 10
    ys, _xs = np.where(mask)
    if len(ys) == 0:
        return None
    return int(ys.min()), int(ys.max())


def main():
    files = sorted(glob.glob("child_*.png"))
    measurements = {f[:-4]: measure(f) for f in files}
    ref = measurements.get(REF_KEY)
    if not ref:
        raise SystemExit(f"reference {REF_KEY}.png not found in current directory")
    ref_body_h = ref[1] - ref[0]
    print(f"reference {REF_KEY}: top={ref[0]} bottom={ref[1]} bodyH={ref_body_h}")

    entries = []
    for key, m in measurements.items():
        if not m:
            continue
        top, bottom = m
        body_h = bottom - top
        scale = round(ref_body_h / body_h, 4) if body_h else 1.0
        if abs(scale - 1.0) < 0.005:
            continue
        entries.append((key, scale))

    entries.sort()
    print(f"\n{len(entries)}개 보정 필요:\n")
    for key, scale in entries:
        print(f"  {key}: {scale},")


if __name__ == "__main__":
    main()
