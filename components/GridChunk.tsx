import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useSnapshot } from "valtio";
import { chunkState } from "@/state/chunks";
import { GridItem } from "@/components/GridItem";

const CHUNK_ITEMS = 22;

export function GridChunk({
  x,
  y,
  startIndex,
}: {
  x: number;
  y: number;
  startIndex: number;
}) {
  const { chunkWidth, chunkHeight } = useSnapshot(chunkState);
  const chunkRef = useRef<HTMLDivElement>(null);
  const topEdgeRef = useRef<HTMLDivElement>(null);
  const rightEdgeRef = useRef<HTMLDivElement>(null);
  const bottomEdgeRef = useRef<HTMLDivElement>(null);
  const leftEdgeRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const oberverRefs = useRef<IntersectionObserver[]>([]);

  const { context, contextSafe } = useGSAP(
    () => {
      if (chunkRef.current) {
        gsap.set(chunkRef.current, {
          width: `${chunkWidth}px`,
          height: `${chunkHeight}px`,
          x: `${x * chunkWidth}px`,
          y: `${y * chunkHeight}px`,
        });
      }
    },
    { scope: chunkRef }
  );

  const createChunk = contextSafe(
    (entry: IntersectionObserverEntry, x: number, y: number) => {
      if (entry.isIntersecting) {
        chunkState.chunkElements.set(`${x},${y}`, {
          x,
          y,
          startIndex: chunkState.currentIndex,
        });
        chunkState.currentIndex += CHUNK_ITEMS;
        loadedRef.current = true;
      }
    }
  );

  const createObserver = contextSafe(
    (
      element: HTMLDivElement | null,
      edgeName: string,
      options: IntersectionObserverInit = {
        threshold: 0,
      }
    ) => {
      if (!element) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          switch (edgeName) {
            case "right":
              createChunk(entry, x + 1, y);
              break;
            case "bottom":
              createChunk(entry, x, y + 1);
              break;
            case "left":
              createChunk(entry, x - 1, y);
              break;
            case "top":
              createChunk(entry, x, y - 1);
              break;
            case "body":
              if (loadedRef.current && !entry.isIntersecting) {
                chunkState.chunkElements.delete(`${x},${y}`);
              }
              break;
          }
        });
      }, options);

      observer.observe(element);
      oberverRefs.current.push(observer);
    }
  );

  useEffect(() => {
    const observers = oberverRefs.current;
    const aspectRatio = chunkWidth / chunkHeight;
    const size = chunkWidth * aspectRatio * 1.5;

    createObserver(chunkRef.current, "body", {
      rootMargin: `${size}px`,
    });
    createObserver(topEdgeRef.current, "top", {
      rootMargin: `${size}px 0px 0px 0px`,
    });
    createObserver(rightEdgeRef.current, "right", {
      rootMargin: `0px ${size}px 0px 0px`,
    });
    createObserver(bottomEdgeRef.current, "bottom", {
      rootMargin: `0px 0px ${size}px 0px`,
    });
    createObserver(leftEdgeRef.current, "left", {
      rootMargin: `0px 0px 0px ${size}px`,
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      context?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={chunkRef} key={`${x},${y}`} className="grid-chunk">
      {/* Row 1 */}
      <GridItem index={startIndex + 0} small />
      <GridItem index={startIndex + 1} small />
      <GridItem index={startIndex + 2} large />
      <GridItem index={startIndex + 3} small />
      <GridItem index={startIndex + 4} large />
      <GridItem index={startIndex + 5} small />

      {/* Row 2 */}
      <GridItem index={startIndex + 6} large />
      <GridItem index={startIndex + 7} small />
      <GridItem index={startIndex + 8} small />

      {/* Row 3 */}
      <GridItem index={startIndex + 9} small />
      <GridItem index={startIndex + 10} small />
      <GridItem index={startIndex + 11} small />
      <GridItem index={startIndex + 12} small />
      <GridItem index={startIndex + 13} large />

      {/* Row 4 */}
      <GridItem index={startIndex + 14} small />
      <GridItem index={startIndex + 15} large />
      <GridItem index={startIndex + 16} small />
      <GridItem index={startIndex + 17} large />

      {/* Row 5 */}
      <GridItem index={startIndex + 18} small />
      <GridItem index={startIndex + 19} small />
      <GridItem index={startIndex + 20} small />
      <GridItem index={startIndex + 21} small />

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
