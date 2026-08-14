import { getHomeData } from "@/lib/game/homeData";
import { HomeScreen } from "@/components/home/HomeScreen";

export default async function HomePage() {
  const data = await getHomeData();
  return <HomeScreen data={data} />;
}
