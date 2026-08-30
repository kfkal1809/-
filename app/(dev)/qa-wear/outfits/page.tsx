import fs from "node:fs";
import path from "node:path";
import { OutfitsQaGrid } from "./OutfitsQaGrid";

// 프로덕션 빌드에는 노출하지 않는다 — 다른 qa-wear 페이지와 같은 패턴.
export default function QaOutfitsPage() {
  if (process.env.NODE_ENV === "production") return null;

  const charDir = path.join(process.cwd(), "public", "images", "character");
  const outfitFull = fs
    .readdirSync(path.join(charDir, "outfit_full"))
    .filter((f) => f.endsWith(".png"))
    .map((f) => f.replace(/\.png$/, ""))
    .sort();
  const dressFull = fs
    .readdirSync(path.join(charDir, "dress_full"))
    .filter((f) => f.endsWith(".png"))
    .map((f) => f.replace(/\.png$/, ""))
    .sort();

  return <OutfitsQaGrid outfitFull={outfitFull} dressFull={dressFull} />;
}
