import { getCustomizeData } from "@/lib/game/customizeData";
import { CustomizeScreen } from "@/components/character/CustomizeScreen";
import { Card } from "@/components/ui/Card";

export default async function CharacterCustomizePage({ params }: PageProps<"/character/[characterId]/customize">) {
  const { characterId } = await params;
  const data = await getCustomizeData(characterId);

  if (!data.found) {
    return (
      <div className="px-4 pt-5">
        <Card tone="cream" className="py-8 text-center text-[13px] text-[var(--color-navy-soft)]">
          캐릭터를 찾을 수 없어요.
        </Card>
      </div>
    );
  }

  return <CustomizeScreen data={data} />;
}
