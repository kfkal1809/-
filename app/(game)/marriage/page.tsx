import { MARRIAGE_DOCUMENT_PRICE } from "@/lib/domain/constants";
import { SpaceStub } from "@/components/ui/SpaceStub";

export default function MarriagePage() {
  return (
    <SpaceStub
      title="해연결호 혼인신고"
      description={`커플링을 보유하면 혼인신고서(\$${MARRIAGE_DOCUMENT_PRICE})를 구매할 수 있어요. 상대가 도장을 찍으면 명예의 전당에 등재돼요. 구매·서명 기능은 다음 업데이트에서 열려요.`}
    />
  );
}
