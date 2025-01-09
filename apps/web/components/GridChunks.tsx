"use client";

import { useEffect, useRef, useState } from "react";
import { chunkState } from "@/app/state.chunk";
import { useSnapshot } from "valtio";

const CHUNK_SIZE = 500;
const CHUNK_ITEMS = 22;

export function GridChunks() {
  const chunkElements = useSnapshot(chunkState.chunkElements);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chunkState.chunkElements.set("0,0", {
      x: 0,
      y: 0,
      startIndex: 0,
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen w-screen overflow-hidden">
      <div className="relative h-0 w-0 overflow-visible" ref={anchorRef}>
        {Array.from(chunkElements.entries()).map(([id, props]) => (
          <GridChunk key={id} {...props} />
        ))}
      </div>
    </div>
  );
}

export function GridChunk({
  x,
  y,
  startIndex,
  style,
}: {
  x: number;
  y: number;
  startIndex: number;
  style?: React.CSSProperties;
}) {
  const topEdgeRef = useRef<HTMLDivElement>(null);
  const rightEdgeRef = useRef<HTMLDivElement>(null);
  const bottomEdgeRef = useRef<HTMLDivElement>(null);
  const leftEdgeRef = useRef<HTMLDivElement>(null);
  const [visibleEdges, setVisibleEdges] = useState<{
    top: boolean | null;
    right: boolean | null;
    bottom: boolean | null;
    left: boolean | null;
  }>({ top: null, right: null, bottom: null, left: null });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const createObserver = (
      element: HTMLDivElement | null,
      edgeName: string
    ) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            switch (edgeName) {
              case "top":
                setVisibleEdges((prev) => ({
                  ...prev,
                  top: entry.isIntersecting,
                }));
                if (entry.isIntersecting) {
                  if (!chunkState.chunkElements.has(`${x},${y - 1}`)) {
                    chunkState.chunkElements.set(`${x},${y - 1}`, {
                      x,
                      y: y - 1,
                      startIndex: chunkState.currentIndex,
                    });
                    chunkState.currentIndex += CHUNK_ITEMS;
                  }
                }
                break;
              case "right":
                setVisibleEdges((prev) => ({
                  ...prev,
                  right: entry.isIntersecting,
                }));
                if (entry.isIntersecting) {
                  if (!chunkState.chunkElements.has(`${x + 1},${y}`)) {
                    chunkState.chunkElements.set(`${x + 1},${y}`, {
                      x: x + 1,
                      y,
                      startIndex: chunkState.currentIndex,
                    });
                    chunkState.currentIndex += CHUNK_ITEMS;
                  }
                }
                break;
              case "bottom":
                setVisibleEdges((prev) => ({
                  ...prev,
                  bottom: entry.isIntersecting,
                }));
                if (entry.isIntersecting) {
                  if (!chunkState.chunkElements.has(`${x},${y + 1}`)) {
                    chunkState.chunkElements.set(`${x},${y + 1}`, {
                      x,
                      y: y + 1,
                      startIndex: chunkState.currentIndex,
                    });
                    chunkState.currentIndex += CHUNK_ITEMS;
                  }
                }
                break;
              case "left":
                setVisibleEdges((prev) => ({
                  ...prev,
                  left: entry.isIntersecting,
                }));
                if (entry.isIntersecting) {
                  if (!chunkState.chunkElements.has(`${x - 1},${y}`)) {
                    chunkState.chunkElements.set(`${x - 1},${y}`, {
                      x: x - 1,
                      y,
                      startIndex: chunkState.currentIndex,
                    });
                    chunkState.currentIndex += CHUNK_ITEMS;
                  }
                }
                break;
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: `${CHUNK_SIZE}px`,
        }
      );

      observer.observe(element);
      observers.push(observer);
    };

    createObserver(topEdgeRef.current, "top");
    createObserver(rightEdgeRef.current, "right");
    createObserver(bottomEdgeRef.current, "bottom");
    createObserver(leftEdgeRef.current, "left");

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  useEffect(() => {
    if (
      visibleEdges.top === false &&
      visibleEdges.right === false &&
      visibleEdges.bottom === false &&
      visibleEdges.left === false
    ) {
      chunkState.chunkElements.delete(`${x},${y}`);
    }
  }, [visibleEdges, x, y]);

  return (
    <div
      className="grid-chunk"
      style={{
        width: `${CHUNK_SIZE}px`,
        height: `${CHUNK_SIZE}px`,
        transform: `translate3d(calc(${x * CHUNK_SIZE}px - 50%), calc(${y * CHUNK_SIZE}px - 50%), 0)`,
        ...style,
      }}
    >
      {/* Row 1 */}
      <div className="grid-item-sm bg-purple-500">{startIndex + 1}</div>
      <div className="grid-item-sm bg-purple-500">{startIndex + 2}</div>
      <div className="grid-item-lg bg-green-500">{startIndex + 3}</div>
      <div className="grid-item-sm bg-blue-500">{startIndex + 4}</div>
      <div className="grid-item-lg bg-blue-500">{startIndex + 5}</div>
      <div className="grid-item-sm bg-blue-500">{startIndex + 6}</div>

      {/* Row 2 */}
      <div className="grid-item-lg bg-purple-500">{startIndex + 7}</div>
      <div className="grid-item-sm bg-blue-500">{startIndex + 8}</div>
      <div className="grid-item-sm bg-blue-500">{startIndex + 9}</div>

      {/* Row 3 */}
      <div className="grid-item-sm bg-green-500">{startIndex + 10}</div>
      <div className="grid-item-sm bg-green-500">{startIndex + 11}</div>
      <div className="grid-item-sm bg-purple-500">{startIndex + 12}</div>
      <div className="grid-item-sm bg-purple-500">{startIndex + 13}</div>
      <div className="grid-item-lg bg-green-500">{startIndex + 14}</div>

      {/* Row 4 */}
      <div className="grid-item-sm bg-blue-500">{startIndex + 15}</div>
      <div className="grid-item-lg bg-blue-500">{startIndex + 16}</div>
      <div className="grid-item-sm bg-blue-500">{startIndex + 17}</div>
      <div className="grid-item-lg bg-purple-500">{startIndex + 18}</div>

      {/* Row 5 */}
      <div className="grid-item-sm bg-blue-500">{startIndex + 19}</div>
      <div className="grid-item-sm bg-blue-500">{startIndex + 20}</div>
      <div className="grid-item-sm bg-green-500">{startIndex + 21}</div>
      <div className="grid-item-sm bg-green-500">{startIndex + 22}</div>

      {/* Edge Detectors */}
      <div
        ref={topEdgeRef}
        className="observable-top-edge absolute top-0 left-0 w-full h-1"
      />
      <div
        ref={rightEdgeRef}
        className="observable-right-edge absolute top-0 right-0 w-1 h-full"
      />
      <div
        ref={leftEdgeRef}
        className="observable-left-edge absolute top-0 left-0 w-1 h-full"
      />
      <div
        ref={bottomEdgeRef}
        className="observable-bottom-edge absolute bottom-0 left-0 w-full h-1"
      />
    </div>
  );
}
