"""해녀 캐릭터 전체 레이어(몸/얼굴/헤어/의상)를 하나의 동일한 MASTER 전신 캔버스
규격으로 다시 굽는다. 런타임에서 topFrac/widthFrac/scaleX/scaleY 같은 레이어별
보정을 거는 예전 방식을 그만두고, 모든 PNG 자체를 이미 정렬된 채로 저장한다 —
게임 쪽 렌더러는 그저 같은 크기 캔버스를 순서대로 겹쳐 그리기만 하면 된다.

기준(MASTER): design-assets/기본 캐릭터 얼굴 및 체형 (11) 해녀.png의 정면 그림과
픽셀 단위로 동일한 public/images/character/base/haenyeo.png(357x772, 네이티브
해상도를 그대로 캔버스 배율로 쓴다 — 이 그림 자체를 다시 스케일하지 않는다).

좌표계 산출(전부 실측, 스크립트 맨 아래 verify()에서 재검증 가능):
  - EAR_WIDTH_BASE(297px, y=312)와 EAR_WIDTH_HEADBALD(340px, head_bald.png
    풀블리드 폭)를 대조해 head_bald.png -> base 배율(SCALE_HEADBALD_TO_MASTER)을 구함.
  - base/haenyeo.png 자체의 목(NECK_Y_BASE, 폭 최솟값), 손목(WRIST_Y_BASE, 손이
    포함된 폭이 급격히 좁아지기 직전), 발바닥(SOLE_Y_BASE, 알파 bbox 최하단)을 실측.
  - 캔버스는 base/haenyeo.png(357x772)에 위/양옆 여유를 더한 CANVAS_W x CANVAS_H로,
    OFFSET_X/Y만큼 이동해 배치한다(큰 헤어·모자가 위쪽에서 잘리지 않게 하기 위한 여유).

산출물(모두 새 폴더에 저장, 기존 원본 파일은 건드리지 않음):
  - public/images/character/master/haenyeo_bald_body.png      (몸+민머리 얼굴, 항상 보이는 기본 레이어)
  - public/images/character/master/haenyeo_bald_skin_mask.png (위 레이어의 피부톤 틴트용 마스크)
  - public/images/character/master/haenyeo_hair_front/*.png   (20종, 새 캔버스로 재배치)
  - public/images/character/master/haenyeo_hair_front/masks/*.png
  - public/images/character/master/haenyeo_hair_back/*.png    (19,20번만 — 앞머리로 분리되고 남은 뒷부분)
  - public/images/character/master/haenyeo_outfit/*.png       (20종. 옷에 같이 그려진 피부는
    지우고(remove_skin), 목~발끝 전체 길이 하나만 등방 스케일 — 팔다리 개별 보정 없음.
    MASTER 몸이 항상 먼저 깔리고 그 위에 옷만 겹치므로, 지워진 자리엔 MASTER의 손/팔/다리가
    그대로 비친다.)

사용법:
    python3 scripts/asset-tools/build_haenyeo_master_canvas.py
"""

import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAR_DIR = os.path.join(ROOT, "public", "images", "character")
OUT_DIR = os.path.join(CHAR_DIR, "master")

# ---------------------------------------------------------------------------
# 1) MASTER 실측값 (base/haenyeo.png 네이티브 좌표계 기준)
# ---------------------------------------------------------------------------
BASE_PATH = os.path.join(CHAR_DIR, "base", "haenyeo.png")
HEAD_BALD_PATH = os.path.join(CHAR_DIR, "base", "head_bald", "haenyeo.png")
HEAD_BALD_MASK_PATH = os.path.join(CHAR_DIR, "base", "masks", "haenyeo_bald_skin_mask.png")

EAR_Y_BASE = 312
EAR_X_CENTER_BASE = 177.5
EAR_WIDTH_BASE = 297
# NECK_Y_BASE=411은 이번에 폐기한 예전 수동 실측값이다. build_master_keypoint_guides.py의
# measure_neck_y()(첫 국소최솟값 탐지, 탐색창을 귀 폭의 0.15~0.65배로 제한)로 다시 재
# 실측하니 393이 나왔다 — 이 값이 실제로 목이 잘록해지는 지점과 더 정확히 일치한다(육안
# 확인). 이 393은 해녀 가이드 이미지(guides/haenyeo_template_guide.png, 사용자에게 전달됨)를
# 만들 때와 동일한 값이고, 사용자가 업로드한 새 haenyeo_outfit_06/08~20.png(441x906)도 바로
# 이 가이드 좌표계에 맞춰 그려졌다 — 그래서 이 스크립트의 좌표계를 가이드와 동일하게
# 맞추지 않으면 새 의상 PNG가 몸에서 어긋난다.
NECK_Y_BASE = 393
WRIST_Y_BASE = 575
HEAD_TOP_BASE = 6
SOLE_Y_BASE = 766

EAR_Y_HEADBALD = 205
EAR_X_CENTER_HEADBALD = 169.5
EAR_WIDTH_HEADBALD = 340

SCALE_HEADBALD_TO_MASTER = EAR_WIDTH_BASE / EAR_WIDTH_HEADBALD  # 0.8735...

# head_bald.png를 base 배율로 줄였을 때, base 좌표계 안에서 붙일 위치(귀 중심 정렬)
HEAD_BALD_PASTE_X = EAR_X_CENTER_BASE - EAR_X_CENTER_HEADBALD * SCALE_HEADBALD_TO_MASTER
HEAD_BALD_PASTE_Y = EAR_Y_BASE - EAR_Y_HEADBALD * SCALE_HEADBALD_TO_MASTER

# ---------------------------------------------------------------------------
# 2) MASTER 캔버스 — base/haenyeo.png(357x772) 자체 배율을 그대로 쓰고, 큰 헤어/모자가
#    안 잘리도록 위/양옆에 여유만 더한다. build_master_keypoint_guides.py와 동일한
#    PADDING_SIDE=42/PADDING_TOP=110/PADDING_BOTTOM=24 규칙(캔버스=357+42*2 x
#    772+110+24 = 441x906)을 그대로 따라 가이드 이미지·신규 의상 PNG와 좌표계를 맞춘다.
# ---------------------------------------------------------------------------
CANVAS_W = 441
CANVAS_H = 906
OFFSET_X = 42
OFFSET_Y = 110

NECK_Y = NECK_Y_BASE + OFFSET_Y
WRIST_Y = WRIST_Y_BASE + OFFSET_Y
SOLE_Y = SOLE_Y_BASE + OFFSET_Y
HEAD_TOP_Y = HEAD_TOP_BASE + OFFSET_Y
CENTER_X = EAR_X_CENTER_BASE + OFFSET_X

# 예전 outfit_full 캔버스(420x512, NECK_Y=140) 좌표를 새 MASTER 캔버스로 옮기기 위한
# 손목 지점 — outfit_full 쪽은 파일마다 실측해서 구한다(build_outfits 참고).
OLD_OUTFIT_NECK_Y = 140

# 예전 hair_normalized 캔버스(380x600)는 head_bald.png 원점(0,0)이 캔버스 (20,140)에
# 오도록 배치돼 있었다(normalize_haenyeo_hair.py) — 그 관계를 이용해 새 MASTER 캔버스로
# 바로 옮긴다(헤어별 재정렬 없이 단일 affine 변환 하나로 충분).
OLD_HAIR_ORIGIN_X = 20
OLD_HAIR_ORIGIN_Y = 140


def ensure_dirs():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "haenyeo_hair_front", "masks"), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "haenyeo_hair_back"), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "haenyeo_outfit"), exist_ok=True)


def paste(canvas: Image.Image, layer: Image.Image, x: float, y: float):
    canvas.alpha_composite(layer, (round(x), round(y)))


def sharpen_alpha(im: Image.Image, threshold: int = 90) -> Image.Image:
    """LANCZOS 리사이즈는 알파 경계에 새로 옅은 페더(반투명 테두리)를 만든다 — 이미
    normalize_haenyeo_hair.py에서 한 번 날카롭게 다듬어둔 헤어 알파도, MASTER 배율로
    다시 리사이즈하면 그 자리에서 또 10px 안팎의 페더가 새로 생긴다(실측 확인: 정수리
    부근 알파가 0에서 255까지 15px에 걸쳐 서서히 올라감). 그 자리엔 항상 진한 두피색이
    깔려 있어서, 이 페더가 "살색 두피 테두리"로 그대로 드러난다. 옅은 알파(threshold
    미만)만 지워 페더 폭을 다시 좁힌다 — 헤어 정규화 스크립트의 sharpen_alpha와 같은 원리."""
    arr = np.array(im).astype(np.float32)
    alpha = arr[:, :, 3]
    scale = 255.0 / max(1, 255 - threshold)
    arr[:, :, 3] = np.clip((alpha - threshold) * scale, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def build_bald_body():
    base = Image.open(BASE_PATH).convert("RGBA")
    head_bald = Image.open(HEAD_BALD_PATH).convert("RGBA")
    head_bald_mask = Image.open(HEAD_BALD_MASK_PATH).convert("RGBA")

    # base에서 목 위(머리+헤어) 영역을 지운다 — 그 자리에 head_bald를 붙인다.
    base_arr = np.array(base)
    erase_until = NECK_Y_BASE - 20  # 약간 여유를 두고 목 위를 전부 지움
    base_arr[:erase_until, :, 3] = 0
    base_no_head = Image.fromarray(base_arr, "RGBA")

    hb_w = round(head_bald.width * SCALE_HEADBALD_TO_MASTER)
    hb_h = round(head_bald.height * SCALE_HEADBALD_TO_MASTER)
    head_bald_scaled = sharpen_alpha(head_bald.resize((hb_w, hb_h), Image.LANCZOS))
    head_bald_mask_scaled = sharpen_alpha(head_bald_mask.resize((hb_w, hb_h), Image.LANCZOS))

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    paste(canvas, base_no_head, OFFSET_X, OFFSET_Y)
    paste(canvas, head_bald_scaled, OFFSET_X + HEAD_BALD_PASTE_X, OFFSET_Y + HEAD_BALD_PASTE_Y)
    canvas.save(os.path.join(OUT_DIR, "haenyeo_bald_body.png"))

    mask_canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    paste(mask_canvas, head_bald_mask_scaled, OFFSET_X + HEAD_BALD_PASTE_X, OFFSET_Y + HEAD_BALD_PASTE_Y)
    mask_canvas.save(os.path.join(OUT_DIR, "haenyeo_bald_skin_mask.png"))

    print(f"MASTER 캔버스: {CANVAS_W}x{CANVAS_H}")
    print(f"  NECK_Y={NECK_Y} WRIST_Y={WRIST_Y} SOLE_Y={SOLE_Y} HEAD_TOP_Y={HEAD_TOP_Y} CENTER_X={CENTER_X}")
    print(f"  head_bald 배치: scale={SCALE_HEADBALD_TO_MASTER:.4f} pos=({OFFSET_X+HEAD_BALD_PASTE_X:.1f},{OFFSET_Y+HEAD_BALD_PASTE_Y:.1f}) size=({hb_w},{hb_h})")
    print(f"  -> {os.path.join(OUT_DIR, 'haenyeo_bald_body.png')}")


def build_hair():
    hair_dir = os.path.join(CHAR_DIR, "haenyeo", "hair_normalized")
    mask_dir = os.path.join(hair_dir, "masks")
    back_keys = {"19", "20"}

    for i in range(1, 21):
        idx = f"{i:02d}"
        hair = Image.open(os.path.join(hair_dir, f"haenyeo_hair_{idx}.png")).convert("RGBA")
        mask = Image.open(os.path.join(mask_dir, f"haenyeo_hair_{idx}_mask.png")).convert("RGBA")

        new_w = round(hair.width * SCALE_HEADBALD_TO_MASTER)
        new_h = round(hair.height * SCALE_HEADBALD_TO_MASTER)
        hair_scaled = sharpen_alpha(hair.resize((new_w, new_h), Image.LANCZOS))
        mask_scaled = sharpen_alpha(mask.resize((new_w, new_h), Image.LANCZOS))

        paste_x = -OLD_HAIR_ORIGIN_X * SCALE_HEADBALD_TO_MASTER + OFFSET_X + HEAD_BALD_PASTE_X
        paste_y = -OLD_HAIR_ORIGIN_Y * SCALE_HEADBALD_TO_MASTER + OFFSET_Y + HEAD_BALD_PASTE_Y

        canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        paste(canvas, hair_scaled, paste_x, paste_y)
        mask_canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        paste(mask_canvas, mask_scaled, paste_x, paste_y)

        if idx in back_keys:
            # 19/20번은 얼굴이 비칠 구멍이 없는 통짜 그림이다 — 이마선 경계로 잘라 이마 위
            # 앞머리만 앞으로, 나머지(정수리~옆~아래로 흘러내리는 부분)는 뒤로 보낸다.
            #
            # 처음엔 "얼굴 마스크 알파의 최상단 행"을 이마선으로 썼는데, 그 마스크는 두상
            # 전체(정수리 포함)를 덮는 영역이라 최상단 행이 사실상 정수리였다 — 그 결과
            # "앞머리" 조각이 머리 위 여유 공간(headroom)에 붕 떠서 화면엔 안 보이고 뒤통수만
            # 보이는 버그가 났다(스크린샷으로 실측 확인). 이마선은 두상 높이의 약 20% 지점
            # (정수리에서 눈썹 위 정도)으로 다시 잡는다.
            face_mask = Image.open(os.path.join(OUT_DIR, "haenyeo_bald_skin_mask.png")).convert("RGBA")
            face_alpha = np.array(face_mask)[:, :, 3]
            face_rows = np.where(face_alpha.max(axis=1) > 20)[0]
            face_cols = np.where(face_alpha.max(axis=0) > 20)[0]
            if len(face_rows):
                head_top, head_bottom = int(face_rows.min()), int(face_rows.max())
                forehead_y = round(head_top + 0.20 * (head_bottom - head_top))
            else:
                forehead_y = round(NECK_Y - 90)
            fx0, fx1 = (int(face_cols.min()), int(face_cols.max())) if len(face_cols) else (0, CANVAS_W)

            hair_alpha = np.array(canvas)[:, :, 3]
            front_mask = np.zeros_like(hair_alpha, dtype=bool)
            front_mask[:forehead_y, fx0:fx1] = True

            arr = np.array(canvas)
            front_arr = arr.copy()
            front_arr[~front_mask, 3] = 0
            back_arr = arr.copy()
            back_arr[front_mask, 3] = 0

            Image.fromarray(front_arr, "RGBA").save(os.path.join(OUT_DIR, "haenyeo_hair_front", f"haenyeo_hair_{idx}.png"))
            Image.fromarray(back_arr, "RGBA").save(os.path.join(OUT_DIR, "haenyeo_hair_back", f"haenyeo_hair_{idx}.png"))

            m_arr = np.array(mask_canvas)
            front_m = m_arr.copy(); front_m[~front_mask, 3] = 0
            Image.fromarray(front_m, "RGBA").save(os.path.join(OUT_DIR, "haenyeo_hair_front", "masks", f"haenyeo_hair_{idx}_mask.png"))
            print(f"  hair {idx}: back-split 적용 (forehead_y={forehead_y})")
        else:
            canvas.save(os.path.join(OUT_DIR, "haenyeo_hair_front", f"haenyeo_hair_{idx}.png"))
            mask_canvas.save(os.path.join(OUT_DIR, "haenyeo_hair_front", "masks", f"haenyeo_hair_{idx}_mask.png"))

    print(f"헤어 20종 -> {os.path.join(OUT_DIR, 'haenyeo_hair_front')} (+ 19/20 hair_back)")


SKIN_REF = np.array([253, 225, 207])  # outfit_full에 이미 구워진 손/팔/다리 피부색 (실측)
SKIN_DIST_THRESHOLD = 30
SKIN_MIN_COMPONENT_SIZE = 400  # 이보다 작은 "피부색과 가까운" 덩어리는 흰 옷감 음영 잡음으로 본다
SKIN_DILATE_ITER = 2  # 피부 제거 경계에 남는 옅은 색 테두리까지 같이 없앤다


def remove_skin(im: Image.Image) -> Image.Image:
    """outfit_full에 옷과 함께 구워진 피부(손/팔/다리/목)만 투명하게 지운다 — 옷 자체는
    건드리지 않는다. 색만으로 피부색 픽셀을 지우면(순수 chroma-key) 흰 티셔츠·양말처럼
    피부색과 색 거리가 가까운 흰 옷감 음영까지 군데군데 뜯겨나갔다(실측 확인 — 옷 곳곳에
    좁쌀만한 구멍이 남는 "좀먹은" 결과). 실제 피부(손/팔/다리)는 수백~수천 픽셀짜리 큰
    덩어리로 뭉쳐 있고, 흰 옷감의 우연한 피부색-근접 픽셀은 수십 픽셀 이하의 작은 잡음으로
    흩어져 있다는 차이를 이용해, 연결 성분 크기로 진짜 피부만 골라낸다."""
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


def measure_span(alpha: np.ndarray, neck_y: int):
    """목선부터 발끝(알파 bbox 최하단)까지의 세로 길이만 잰다 — 손목 위치 추정처럼
    실루엣 굴곡을 해석해야 하는 부분은 이제 없다(피부를 지우고 나면 손/발 끝 모양이
    옷마다 달라서가 아니라 인물 자체가 크게/작게 그려진 차이만 남기 때문에, 목~발끝
    "전체 키" 하나만 등방(가로세로 동일 비율) 스케일하면 된다)."""
    ys, xs = np.where(alpha > 20)
    if len(ys) == 0:
        return None, None
    sole_y = int(ys.max())
    cx = (int(xs.min()) + int(xs.max())) / 2
    return sole_y, cx


NEW_ART_DIR = os.path.join(ROOT, "design-assets")
# 2026-09-06 사용자가 GitHub에 직접 업로드한 14종 — 이미 가이드 이미지(441x906, NECK_Y=503
# 등)의 좌표계에 맞춰 스킨(손/팔/다리)까지 지운 채로 그려져 있다. 이 14종은 outfit_full
# 원본을 다시 가공하지 않고 파일을 그대로(알파 페더만 sharpen) 쓴다.
NEW_ART_KEYS = {"06", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"}
# 01~05, 07은 아직 업로드되지 않았다(사용자가 나중에 올릴 예정) — 여기서 outfit_full의
# 스킨-베이크 구버전 원본으로 임시 생성하지 않는다. 파일이 없으면 없는 대로 결과물 폴더에
# 만들지 않고 누락으로만 보고한다(가짜 상품 생성 금지).
MISSING_KEYS = {"01", "02", "03", "04", "05", "07"}


def build_outfits():
    target_span = SOLE_Y - NECK_Y

    need_manual_review = []
    missing = []
    for i in range(1, 21):
        idx = f"{i:02d}"

        if idx in MISSING_KEYS:
            missing.append(idx)
            print(f"  outfit {idx}: [누락] design-assets/haenyeo_outfit_{idx}.png 없음 — 사용자가 추후 업로드 예정, 생성하지 않음")
            continue

        new_art_path = os.path.join(NEW_ART_DIR, f"haenyeo_outfit_{idx}.png")
        if idx in NEW_ART_KEYS and os.path.exists(new_art_path):
            im = Image.open(new_art_path).convert("RGBA")
            if im.size != (CANVAS_W, CANVAS_H):
                need_manual_review.append((idx, f"신규 원본 크기 {im.size} != 캔버스 ({CANVAS_W},{CANVAS_H})"))
                print(f"  outfit {idx}: [수동 확인] 신규 원본 크기 불일치 {im.size}")
                continue
            canvas = sharpen_alpha(im, threshold=40)
            # 2026-09-07 사용자 결정: 이 번호들은 기존 haenyeo_outfit_* 상품(SKU)이 이미 물고
            # 있던 번호와 겹치지만 디자인은 완전히 다른 별개의 옷이다 — 파일명을 그대로
            # haenyeo_outfit_{idx}.png로 저장하면 기존 SKU가 자동으로 이 새 그림을 입게 되어
            # "기존 상품 이미지를 바꾸지 말라"는 지시를 어긴다. haenyeo_custom_outfit_{idx}로
            # 저장해 기존 번호형 asset key(haenyeo_outfit_NN)와 완전히 분리한다 — 기존 SKU는
            # 이제 이 번호에 대응하는 새 MASTER 파이프라인 산출물이 없으므로 안전하게
            # "의상 없음(MASTER 기본 이너웨어만)"으로 대체 없이 표시된다.
            canvas.save(os.path.join(OUT_DIR, "haenyeo_outfit", f"haenyeo_custom_outfit_{idx}.png"))
            print(f"  outfit {idx}: 신규 업로드 원본 그대로 사용 -> haenyeo_custom_outfit_{idx}.png (기존 SKU와 분리)")
            continue

        # 여기 도달하면 NEW_ART_KEYS/MISSING_KEYS 분류에 없는 예상 밖 번호 — 코드 버그이지
        # 정상 데이터 경로가 아니므로 조용히 넘기지 않고 수동 확인 목록에 올린다.
        need_manual_review.append((idx, "분류되지 않은 outfit 번호"))
        print(f"  outfit {idx}: [수동 확인] NEW_ART_KEYS/MISSING_KEYS 어디에도 없음")

    if need_manual_review:
        print("  [수동 확인 필요]")
        for idx, reason in need_manual_review:
            print(f"    haenyeo_outfit_{idx}: {reason}")
    if missing:
        print(f"  [누락 {len(missing)}종] {', '.join('haenyeo_outfit_' + i for i in missing)}")

    print(f"의상 {len(NEW_ART_KEYS)}종 생성, {len(missing)}종 누락 -> {os.path.join(OUT_DIR, 'haenyeo_outfit')}")
    return missing, need_manual_review


# 2026-09-07 사용자 지적: 실제 선택 가능한 8종(VALID_HAIR_KEYS)에서도 머리카락 알파 가장자리가
# MASTER 두상의 진짜 윤곽선(어두운 갈색 스트로크)보다 1~수px 안쪽에서 끝나는 경우가 있어,
# 그 사이로 얇은 "피부색+외곽선" 실선이 비친다(민머리 후광). 헤어 원화를 다시 그리거나
# 억지로 확대/이동하지 않고, "헤어를 쓰면 그 자리엔 어차피 항상 머리카락만 있어야 한다"는
# 사실을 이용해 문제를 없앤다 — 두상 실루엣의 가장 바깥 테두리(perimeter band, 두피 색+
# 외곽선이 실제로 존재하는 폭 좁은 링)에서, 해당 헤어가 덮지 못하는 부분만 MASTER 몸 레이어
# 자체에서 투명하게 지운 "헤어 전용 몸 변형"을 헤어스타일별로 미리 구워둔다. 얼굴 오val(눈/코/
# 입/볼터치)과 귀는 절대 건드리지 않는다(고정 좌표로 보호) — 그 결과 그 두 영역은 항상
# MASTER 원본 그대로 남는다.
HAENYEO_HAIR_VALID_KEYS = ["03", "05", "06", "07", "11", "12", "16", "17"]
# 두상 윤곽에서 안쪽으로 얼마나 파고들어 "테두리 링"으로 볼지 — 처음 7px로 시작했더니
# hair_03/11처럼 헤어 가장자리와 두상 실제 윤곽선 사이 간격이 더 넓은 스타일에서 여전히
# 실선이 남았다. 18px에서 실측 확인 결과 사라졌고, 20px까지 올려도 얼굴 오val을 침범하지
# 않는 것을 확인해 여유를 조금 더 두었다(귀·눈·입은 별도 보호 구역으로 이미 고정 보호).
PERIMETER_EROSION_PX = 20
HEAD_ZONE_Y0 = HEAD_TOP_Y
HEAD_ZONE_Y1 = NECK_Y - 15  # 목선 위까지만 — 어깨/목 외곽선은 절대 건드리지 않는다
# 귀 보호 구역(좌/우) — EAR_X_CENTER_BASE/EAR_Y_BASE 기준, 귀 폭보다 넉넉하게 잡아 확실히 보호
EAR_PROTECT_HALF_W = 45
EAR_PROTECT_Y0 = EAR_Y_BASE + OFFSET_Y - 70
EAR_PROTECT_Y1 = EAR_Y_BASE + OFFSET_Y + 110
EAR_LEFT_X = CENTER_X - EAR_WIDTH_BASE / 2
EAR_RIGHT_X = CENTER_X + EAR_WIDTH_BASE / 2


# 2026-09-07 두 번째 지적: 몸 쪽에서 두상 외곽선을 지우는 위 방식(build_hair_body_variants)
# 대신, 헤어 원화 자체를 다시 그리지 않고 "MASTER 두상 중심/이마선 기준 개별 계산한 균일
# 확대+이동"으로 실제 441x906 PNG를 새로 구워달라는 요청. 스케일 중심(anchor)을 눈 바로
# 위(ANCHOR_Y=400)에 고정해두면, 앵커보다 위에 있는 머리(정수리·옆머리 대부분)는 확대할수록
# 바깥으로 더 밀려나 두상을 넓게 덮게 되고, 앵커에 가까운 앞머리 밑단(눈 바로 위)은 스케일을
# 키워도 원래 위치에서 거의 움직이지 않아 눈을 침범하지 않는다 — "얼굴은 그대로 두고 헤어만
# 키운다"를 하나의 앵커점으로 구현한 것.
#
# 각 스타일마다 만족해야 할 두 조건을 만족하는 가장 작은 스케일을 찾는다(직접 탐색):
#   1) perimeter_band(두상 테두리 링, 정수리~귀 위 구간)의 97% 이상을 헤어가 덮을 것
#   2) 양쪽 눈 좌표 원형 구역(반경 16px)의 5% 이하만 헤어가 덮을 것(=사실상 안 가림)
# 이 두 조건을 동시에 만족하는 (scale, dx, dy) 중 이동량이 가장 작은 것을 채택한다.
HAIR_NORM_ANCHOR_X = CENTER_X
HAIR_NORM_ANCHOR_Y = 400.0
HAIR_NORM_EYE_L = (175, 410)
HAIR_NORM_EYE_R = (265, 410)
HAIR_NORM_EYE_RADIUS = 16
HAIR_NORM_PERIM_EROSION = 10
HAIR_NORM_HEAD_ZONE_Y0 = 235
HAIR_NORM_HEAD_ZONE_Y1 = 430  # 관자놀이~귀 위쪽까지만 — 그 아래(뺨/턱선)는 짧은 헤어가 원래
# 덮지 않는 정상 범위라 강제로 요구하지 않는다(11/12번처럼 귀밑 길이 스타일에서 그 아래까지
# 요구하면 실제로 덮을 수 없는 목표가 돼버려 탐색이 실패했었다).


def _hair_norm_perimeter_band():
    body = Image.open(os.path.join(OUT_DIR, "haenyeo_bald_body.png")).convert("RGBA")
    opaque = np.array(body)[:, :, 3] > 20
    eroded = ndimage.binary_erosion(opaque, iterations=HAIR_NORM_PERIM_EROSION)
    band = opaque & ~eroded
    zone = np.zeros_like(opaque)
    zone[HAIR_NORM_HEAD_ZONE_Y0:HAIR_NORM_HEAD_ZONE_Y1, :] = True
    band = band & zone
    ear_protect = np.zeros_like(opaque)
    for ex in (EAR_LEFT_X, EAR_RIGHT_X):
        x0, x1 = max(0, round(ex - EAR_PROTECT_HALF_W)), min(CANVAS_W, round(ex + EAR_PROTECT_HALF_W))
        ear_protect[EAR_PROTECT_Y0:EAR_PROTECT_Y1, x0:x1] = True
    return band & ~ear_protect


def _hair_norm_eye_coverage(alpha_bool, cx, cy, r=HAIR_NORM_EYE_RADIUS):
    y0, y1 = max(0, cy - r), min(CANVAS_H, cy + r + 1)
    x0, x1 = max(0, cx - r), min(CANVAS_W, cx + r + 1)
    yy, xx = np.ogrid[y0:y1, x0:x1]
    mask = (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
    region = alpha_bool[y0:y1, x0:x1][mask]
    return float(region.mean()) if region.size else 0.0


def _hair_norm_transform_alpha(alpha_u8, s, dx, dy):
    if s == 1.0:
        scaled, new_w, new_h, paste_x, paste_y = alpha_u8, CANVAS_W, CANVAS_H, 0, 0
    else:
        new_w, new_h = max(1, round(CANVAS_W * s)), max(1, round(CANVAS_H * s))
        scaled = np.array(Image.fromarray(alpha_u8).resize((new_w, new_h), Image.BILINEAR))
        paste_x = round(HAIR_NORM_ANCHOR_X - HAIR_NORM_ANCHOR_X * s)
        paste_y = round(HAIR_NORM_ANCHOR_Y - HAIR_NORM_ANCHOR_Y * s)
    out = np.zeros((CANVAS_H, CANVAS_W), dtype=np.uint8)
    px, py = paste_x + round(dx), paste_y + round(dy)
    sx0, sy0 = max(0, -px), max(0, -py)
    dx0, dy0 = max(0, px), max(0, py)
    w = min(new_w - sx0, CANVAS_W - dx0)
    h = min(new_h - sy0, CANVAS_H - dy0)
    if w > 0 and h > 0:
        out[dy0:dy0 + h, dx0:dx0 + w] = scaled[sy0:sy0 + h, sx0:sx0 + w]
    return out


def _hair_norm_search(alpha_u8, perimeter_band, perim_total):
    best = None
    for i in range(0, 41):  # scale 1.00 ~ 1.40, 0.01 단위
        s = round(1.0 + 0.01 * i, 2)
        found = None
        for dy in range(-15, 16, 2):
            for dx in range(-15, 16, 2):
                t = _hair_norm_transform_alpha(alpha_u8, s, dx, dy)
                tb = t > 40
                perim_cov = (tb & perimeter_band).sum() / perim_total
                if perim_cov < 0.97:
                    continue
                ec = max(
                    _hair_norm_eye_coverage(tb, *HAIR_NORM_EYE_L),
                    _hair_norm_eye_coverage(tb, *HAIR_NORM_EYE_R),
                )
                if ec > 0.05:
                    continue
                score = (abs(dx) + abs(dy), ec)
                if found is None or score < found[0]:
                    found = (score, (s, dx, dy, perim_cov, ec))
        if found is not None:
            best = found[1]
            break
    return best


def _decontaminate_white_matte(arr: np.ndarray) -> np.ndarray:
    """반투명 가장자리 픽셀에 남은 흰색 배경 오염을 제거한다(알파는 그대로 — 부드러운
    안티앨리어싱 유지, 색상만 원래 머리카락 색으로 복원). 원본 PNG가 흰 캔버스 위에서
    내보내진 것으로 실측 확인됨(예: alpha=27인 가장자리 픽셀의 RGB가 정확히 255,255,255)."""
    out = arr.astype(np.float32).copy()
    a = out[:, :, 3] / 255.0
    partial = (a > 0) & (a < 1)
    for c in range(3):
        bg = 255.0
        fg = (out[:, :, c] - (1 - a) * bg) / np.maximum(a, 1e-3)
        out[:, :, c] = np.where(partial, np.clip(fg, 0, 255), out[:, :, c])
    return out.astype(np.uint8)


def _remove_isolated_specks(arr: np.ndarray, min_size: int = 300) -> np.ndarray:
    """머리카락 본체와 붙어 있지 않은 작은 흰색/잡음 조각(원본 크롭 잔여물)을 지운다 —
    실측 확인: hair_16 원본 정수리 위쪽에 본체와 완전히 분리된 흰 얼룩 5개(15~135px)가
    이미 있었다(스케일 전부터 존재, 이번에 만든 문제 아님). 가장 큰 연결 성분(머리카락
    본체)만 남기고 나머지는 투명 처리."""
    alpha = arr[:, :, 3]
    opaque = alpha > 20
    labeled, num = ndimage.label(opaque)
    if num <= 1:
        return arr
    sizes = ndimage.sum(opaque, labeled, range(1, num + 1))
    main_label = int(np.argmax(sizes)) + 1
    keep = labeled == main_label
    out = arr.copy()
    out[~keep & opaque, 3] = 0
    return out


def _premultiplied_resize(rgba_u8: np.ndarray, new_w: int, new_h: int) -> np.ndarray:
    """색상을 알파로 미리 곱한(premultiplied) 상태로 리샘플한 뒤 다시 나눠 되돌린다 —
    LANCZOS를 색상 채널에 직접 쓰면 완전 투명 픽셀의 임의 색상(흔히 흰 배경 잔여물)이
    보이는 가장자리로 섞여 들어와 흰 테두리가 생긴다(실측 확인: 확대 후 정수리 둘레에
    톱니 모양 흰 테두리 발생). 미리 곱한 색상은 투명한 곳이 항상 0이라 이 오염이 생기지
    않는다."""
    rgb = rgba_u8[:, :, :3].astype(np.float32)
    a = rgba_u8[:, :, 3].astype(np.float32) / 255.0
    premult = rgb * a[:, :, None]

    premult_img = Image.fromarray(premult.astype(np.uint8), "RGB").resize((new_w, new_h), Image.LANCZOS)
    alpha_img = Image.fromarray(rgba_u8[:, :, 3]).resize((new_w, new_h), Image.LANCZOS)

    premult_r = np.array(premult_img).astype(np.float32)
    alpha_r = np.array(alpha_img).astype(np.float32)
    safe_a = np.maximum(alpha_r / 255.0, 1e-3)[:, :, None]
    rgb_r = np.clip(premult_r / safe_a, 0, 255)

    out = np.zeros((new_h, new_w, 4), dtype=np.uint8)
    out[:, :, :3] = rgb_r.astype(np.uint8)
    out[:, :, 3] = alpha_r.astype(np.uint8)
    return out


def _apply_hair_norm_transform(rgba_u8: np.ndarray, s: float, dx: int, dy: int) -> np.ndarray:
    if s == 1.0:
        scaled, new_w, new_h, paste_x, paste_y = rgba_u8, CANVAS_W, CANVAS_H, 0, 0
    else:
        new_w, new_h = max(1, round(CANVAS_W * s)), max(1, round(CANVAS_H * s))
        scaled = _premultiplied_resize(rgba_u8, new_w, new_h)
        paste_x = round(HAIR_NORM_ANCHOR_X - HAIR_NORM_ANCHOR_X * s)
        paste_y = round(HAIR_NORM_ANCHOR_Y - HAIR_NORM_ANCHOR_Y * s)
    out = np.zeros((CANVAS_H, CANVAS_W, 4), dtype=np.uint8)
    px, py = paste_x + round(dx), paste_y + round(dy)
    sx0, sy0 = max(0, -px), max(0, -py)
    dx0, dy0 = max(0, px), max(0, py)
    w = min(new_w - sx0, CANVAS_W - dx0)
    h = min(new_h - sy0, CANVAS_H - dy0)
    if w > 0 and h > 0:
        out[dy0:dy0 + h, dx0:dx0 + w] = scaled[sy0:sy0 + h, sx0:sx0 + w]
    return out


def normalize_valid_hair_to_master_head():
    perimeter_band = _hair_norm_perimeter_band()
    perim_total = int(perimeter_band.sum())
    hair_dir = os.path.join(OUT_DIR, "haenyeo_hair_front")
    mask_dir = os.path.join(hair_dir, "masks")

    report = []
    for k in HAENYEO_HAIR_VALID_KEYS:
        hair_path = os.path.join(hair_dir, f"haenyeo_hair_{k}.png")
        mask_path = os.path.join(mask_dir, f"haenyeo_hair_{k}_mask.png")
        hair_arr = _remove_isolated_specks(np.array(Image.open(hair_path).convert("RGBA")))
        alpha_u8 = hair_arr[:, :, 3]

        found = _hair_norm_search(alpha_u8, perimeter_band, perim_total)
        if found is None:
            print(f"  [보고] hair_{k}: 눈을 가리지 않으면서 두상을 덮는 조합을 찾지 못함 — 원화 자체의 한계로 보임")
            report.append((k, None))
            continue
        s, dx, dy, perim_cov, ec = found

        hair_clean = np.dstack([_decontaminate_white_matte(hair_arr)[:, :, :3], alpha_u8])
        new_hair = _apply_hair_norm_transform(hair_clean, s, dx, dy)
        Image.fromarray(new_hair, "RGBA").save(hair_path)

        if os.path.exists(mask_path):
            mask_arr = _remove_isolated_specks(np.array(Image.open(mask_path).convert("RGBA")))
            mask_clean = np.dstack([_decontaminate_white_matte(mask_arr)[:, :, :3], mask_arr[:, :, 3]])
            new_mask = _apply_hair_norm_transform(mask_clean, s, dx, dy)
            Image.fromarray(new_mask, "RGBA").save(mask_path)

        print(f"  hair_{k}: scale={s} dx={dx} dy={dy} 테두리커버={perim_cov:.3f} 눈침범={ec:.3f}")
        report.append((k, (s, dx, dy, perim_cov, ec)))

    return report


def build_hair_body_variants():
    body = Image.open(os.path.join(OUT_DIR, "haenyeo_bald_body.png")).convert("RGBA")
    body_arr = np.array(body)
    opaque = body_arr[:, :, 3] > 20

    eroded = ndimage.binary_erosion(opaque, iterations=PERIMETER_EROSION_PX)
    perimeter_band = opaque & ~eroded

    head_zone = np.zeros_like(opaque)
    head_zone[HEAD_ZONE_Y0:HEAD_ZONE_Y1, :] = True
    perimeter_band = perimeter_band & head_zone

    ear_protect = np.zeros_like(opaque)
    for ex in (EAR_LEFT_X, EAR_RIGHT_X):
        x0, x1 = max(0, round(ex - EAR_PROTECT_HALF_W)), min(CANVAS_W, round(ex + EAR_PROTECT_HALF_W))
        ear_protect[EAR_PROTECT_Y0:EAR_PROTECT_Y1, x0:x1] = True
    perimeter_band = perimeter_band & ~ear_protect

    hair_dir = os.path.join(OUT_DIR, "haenyeo_hair_front")
    for k in HAENYEO_HAIR_VALID_KEYS:
        hair = Image.open(os.path.join(hair_dir, f"haenyeo_hair_{k}.png")).convert("RGBA")
        hair_covers = np.array(hair)[:, :, 3] > 40
        erase = perimeter_band & ~hair_covers
        variant = body_arr.copy()
        variant[erase, 3] = 0
        Image.fromarray(variant, "RGBA").save(os.path.join(OUT_DIR, f"haenyeo_bald_body_hair_{k}.png"))
        print(f"  hair-body variant {k}: 테두리 {int(erase.sum())}px 정리 -> haenyeo_bald_body_hair_{k}.png")

    print(f"헤어 전용 몸 변형 {len(HAENYEO_HAIR_VALID_KEYS)}종 -> {OUT_DIR}")


def main():
    ensure_dirs()
    build_bald_body()
    build_hair()
    build_outfits()
    normalize_valid_hair_to_master_head()
    build_hair_body_variants()


if __name__ == "__main__":
    main()
