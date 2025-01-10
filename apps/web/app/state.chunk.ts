import { proxy } from "valtio";
import { proxyMap } from "valtio/utils";
import { gsap } from "gsap";
export interface ChunkState {
  chunkElements: Map<string, ChunkProps>;
  images: string[];
  currentIndex: number;
  hasMoved: boolean;
}

type ChunkProps = {
  x: number;
  y: number;
  startIndex: number;
  style?: React.CSSProperties;
};

export const chunkState = proxy<ChunkState>({
  chunkElements: proxyMap<string, ChunkProps>(),
  // images: Array.from({ length: 22 }, (_, i) => `/shoes/shoe-${i + 1}.webp?color=${generateHexColor()}`),
  images: Array.from({ length: 50 }, (_, i) => `https://picsum.photos/seed/${i}/200/300?color=${generateHexColor()}`),
  currentIndex: 0,
  hasMoved: false,
});

function generateHexColor() {
  // return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  const graysArray = ["#AAA", "#BBB", "#CCC", "#DDD", "#EEE"];
  return gsap.utils.random(graysArray);
}
