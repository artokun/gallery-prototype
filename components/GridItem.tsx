import React, { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { cn } from "@/utils/cn";
import { ChunkState, chunkState, type IGridItem } from "@/state/chunks";
import { useSnapshot } from "valtio";
import Image from "next/image";
// import Image from "next/image";

const graysArray = ["#AAA", "#BBB", "#CCC", "#DDD"];

function UnmemoizedGridItem({
  index,
  large,
  small,
}: {
  index: number;
  large?: boolean;
  small?: boolean;
}) {
  const { images } = useSnapshot(chunkState) as ChunkState;
  const itemWrapperRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [image, setImage] = useState<IGridItem | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { context, contextSafe } = useGSAP(
    () => {
      gsap.set(itemRef.current, {
        opacity: 0,
        scale: 0,
        background: gsap.utils.random(graysArray),
      });
    },
    { scope: itemWrapperRef, dependencies: [] }
  );

  const setObserver = contextSafe(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          try {
            if (entry.isIntersecting) {
              gsap.to(itemRef.current, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: "power2.inOut",
              });
            } else {
              gsap.to(itemRef.current, {
                opacity: 0,
                scale: 0,
                duration: 0.3,
                ease: "power2.inOut",
              });
            }
          } catch (error) {
            console.error(error);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px 0px 0px",
      }
    );

    observer.observe(itemWrapperRef.current!);
    observerRef.current = observer;
  });

  const recursiveGetImage = useCallback(() => {
    const image = images[index % images.length];
    if (image) {
      if (itemRef.current) {
        gsap.set(itemRef.current, {
          background: image.color,
        });
      }

      setImage(image);
    }
  }, [images, index]);

  useEffect(() => {
    if (!images) return;
    setObserver();
    recursiveGetImage();

    return () => {
      context.revert();
      observerRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const imageFetcher = contextSafe(() => {
    if (!imgRef.current) return;

    gsap.to(imgRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.inOut",
    });
  });

  return (
    <div
      ref={itemWrapperRef}
      className={cn(
        "grid-item relative inset-0 cursor-pointer",
        large && "grid-item-lg",
        small && "grid-item-sm"
      )}
    >
      <div
        className="preview-image relative h-full w-full overflow-hidden rounded-xl"
        ref={itemRef}
      >
        {image && (
          <Image
            ref={imgRef}
            onLoad={imageFetcher}
            width={image.width}
            height={image.height}
            src={image.urls.small}
            alt={image.description || "Design"}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* <img
          ref={imgRef}
          onLoad={imageFetcher}
          width={image?.width}
          height={image?.height}
          src={image?.urls.small}
          alt={image?.description || "Design"}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
        /> */}
      </div>
    </div>
  );
}

export const GridItem = React.memo(UnmemoizedGridItem);
GridItem.displayName = "GridItem";
