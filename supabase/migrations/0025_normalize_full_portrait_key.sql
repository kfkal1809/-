-- 캐릭터 체형 일관성 버그 수정의 일부: 예전 fullPortraitKey 렌더링 경로(완성 전신 PNG를
-- 통째로 그려 MASTER 기본 체형을 우회하던 방식)를 outfitAssetKey 경로 하나로 통합했다
-- (CharacterSprite.tsx, lib/domain/itemAppearance.ts, lib/domain/itemAppearanceVariants.ts
-- 참고 — scripts/asset-tools/convert_dress_full_to_outfit.py로 기존 dress_full 90개를
-- 전부 같은 파일명의 outfit_full 자산으로 재변환해 값 자체는 그대로 재사용 가능하다).
--
-- 이미 원피스류를 착용해 appearance_json에 fullPortraitKey가 저장된 기존 캐릭터는 이 값을
-- outfitAssetKey로 옮기지 않으면(코드에서 fullPortraitKey 필드 자체를 더 이상 읽지 않으므로)
-- 옷이 사라지고 기본 체형만 보이게 된다. 두 단계로 정규화한다:
--   1) fullPortraitKey에 실제 값이 있고 outfitAssetKey가 비어있으면, 값을 그대로 옮긴다
--      (파일명이 동일하게 재변환됐으므로 문자열 값 자체는 안 바뀐다).
--   2) 그 외 남은 fullPortraitKey 키(null 값이었거나 이미 outfitAssetKey가 있던 경우)는
--      죽은 필드이므로 그냥 제거한다.
-- 두 UPDATE 모두 실행 후에는 appearance_json에 fullPortraitKey 키가 전혀 남지 않으므로
-- 재실행해도 안전하다(idempotent).

update characters
set appearance_json = (appearance_json - 'fullPortraitKey')
  || jsonb_build_object('outfitAssetKey', appearance_json -> 'fullPortraitKey')
where appearance_json ? 'fullPortraitKey'
  and appearance_json ->> 'fullPortraitKey' is not null
  and coalesce(appearance_json ->> 'outfitAssetKey', '') = '';

update characters
set appearance_json = appearance_json - 'fullPortraitKey'
where appearance_json ? 'fullPortraitKey';
