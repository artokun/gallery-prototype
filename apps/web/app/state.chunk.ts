import { proxy } from "valtio";
import { proxyMap } from "valtio/utils";

export interface ChunkState {
  chunkElements: Map<string, ChunkProps>;
  images: string[];
  currentIndex: number;
}

type ChunkProps = {
  x: number;
  y: number;
  startIndex: number;
  style?: React.CSSProperties;
};

export const chunkState = proxy<ChunkState>({
  chunkElements: proxyMap<string, ChunkProps>(),
  images: Array.from({ length: 100 }, (_, i) => `https://picsum.photos/seed/${i}/200/300?color=${generateHexColor()}`),
  currentIndex: 0,
});

function generateHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
