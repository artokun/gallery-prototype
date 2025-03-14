import { GridChunks } from "@/components/GridChunks";
import { IGridItem } from "@/state/chunks";
import { IUnsplashItem } from "@/state/chunks";

export default async function Home() {
  const images = await Promise.all(
    new Array(9)
      .fill(0)
      .map((_, i) => fetchImages({ page: i + 1, perPage: 22 }))
  ).then((images) => images.flat());

  return (
    <main>
      <GridChunks images={images} />
    </main>
  );
}

const fetchImages = async ({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) => {
  const images = await fetch(
    `https://api.unsplash.com/photos?client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&per_page=${perPage}&page=${page}`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Unsplash API error: ${res.status} ${res.statusText}`);
      }
      return res.json() as Promise<IUnsplashItem[]>;
    })
    .then((items) => items.map(mapper));

  return images;
};

const mapper = (item: IUnsplashItem): IGridItem => ({
  id: item.id,
  height: item.height,
  width: item.width,
  urls: item.urls,
  description: item.description,
  color: item.color,
});
