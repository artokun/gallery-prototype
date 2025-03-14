"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { chunkState, IGridItem } from "@/state/chunks";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import InertiaPlugin from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";
import { ref, useSnapshot } from "valtio";
import { isMobile } from "react-device-detect";
import { GridChunk } from "@/components/GridChunk";
import { useGSAP } from "@gsap/react";

const CHUNK_ITEMS = 22;

export function GridChunks({ images }: { images: IGridItem[] }) {
  const { chunkElements } = useSnapshot(chunkState);
  const anchorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(Observer, Draggable, InertiaPlugin);

    chunkState.images = ref(images);

    // Prevent horizontal overscroll navigation
    const preventDefault = (e: Event) => e.preventDefault();

    document.addEventListener("wheel", preventDefault, { passive: false });

    if (!isMobile) {
      Observer.create({
        target: containerRef.current,
        onWheel: (self) => {
          if (!chunkState.hasMoved) {
            chunkState.hasMoved = true;
          }
          const currentY = gsap.getProperty(anchorRef.current, "y");
          const currentX = gsap.getProperty(anchorRef.current, "x");

          gsap.set(anchorRef.current, {
            x: Number(currentX) - self.deltaX,
            y: Number(currentY) - self.deltaY,
          });
        },
      });
    }

    Draggable.create(anchorRef.current, {
      inertia: true,
      zIndexBoost: false,
      minDuration: 0,
      onClick: (e) => {
        e.preventDefault();
        console.log("clicked", e.target);
      },
    });

    return () => {
      document.removeEventListener("wheel", preventDefault);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { contextSafe } = useGSAP(() => {}, {
    scope: containerRef,
    dependencies: [],
  });

  const resetAnchorPosition = contextSafe(() => {
    gsap.set(anchorRef.current, {
      x: 0,
      y: 0,
    });
  });

  useEffect(() => {
    if (chunkElements.size === 0) {
      resetAnchorPosition();
      chunkState.currentIndex = 0;
      chunkState.chunkElements.set("0,0", {
        x: 0,
        y: 0,
        startIndex: 0,
      });
      chunkState.currentIndex = CHUNK_ITEMS;
    }
  }, [chunkElements.size, resetAnchorPosition]);

  return (
    <div
      ref={containerRef}
      id="chunks-container"
      className="flex justify-center items-center h-full w-full overflow-hidden"
    >
      <div
        ref={anchorRef}
        id="chunks-anchor"
        className="relative w-screen h-screen overflow-visible"
      >
        {Array.from(chunkElements.entries()).map(([id, props]) => (
          <GridChunk key={id} {...props} />
        ))}
      </div>
    </div>
  );
}
