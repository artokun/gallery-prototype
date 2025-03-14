import { proxy, ref } from "valtio";
import { proxyMap, devtools } from "valtio/utils";

export type ValtioRef<T extends object> = ReturnType<typeof ref<T>>;

// https://api.unsplash.com/photos?client_id=1234567890
export interface IUnsplashItem {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  likes: number;
  liked_by_user: boolean;
  description: string;
  user: {
    id: string;
    username: string;
    name: string;
    portfolio_url: string;
    bio: string;
    location: string;
    total_likes: number;
    total_photos: number;
    total_collections: number;
    instagram_username: string;
    twitter_username: string;
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    links: {
      self: string;
      html: string;
      photos: string;
      likes: string;
      portfolio: string;
    };
  };
  current_user_collections: [
    {
      id: number;
      title: string;
      published_at: string;
      last_collected_at: string;
      updated_at: string;
      cover_photo: null;
      user: null;
    }
  ];
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
}

export type IGridItem = Pick<
  IUnsplashItem,
  "id" | "height" | "width" | "urls" | "description" | "color"
>;

export interface ChunkState {
  chunkElements: Map<string, ChunkProps>;
  images: ValtioRef<IGridItem[]>;
  currentIndex: number;
  hasMoved: boolean;
  chunkWidth: number;
  chunkHeight: number;
}

type ChunkProps = {
  x: number;
  y: number;
  startIndex: number;
  style?: React.CSSProperties;
};

export const chunkState = proxy<ChunkState>({
  chunkElements: proxyMap<string, ChunkProps>(),
  images: ref([]),
  currentIndex: 0,
  hasMoved: false,
  chunkWidth: 1000,
  chunkHeight: 900, // Used to be 1000, but we're using 730 for wider grid items
});

devtools(chunkState);
