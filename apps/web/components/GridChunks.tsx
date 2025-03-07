"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { chunkState } from "@/app/state.chunk";
import { cn } from "@workspace/ui/lib/utils";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { useSnapshot } from "valtio";
import InertiaPlugin from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";

const CHUNK_SIZE = 1000;
const CHUNK_ITEMS = 22;

export function GridChunks() {
  const { chunkElements } = useSnapshot(chunkState);
  const anchorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useLayoutEffect(() => {
    gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin, Observer);

    // Prevent horizontal overscroll navigation
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("wheel", preventDefault, { passive: false });

    return () => {
      document.removeEventListener("wheel", preventDefault);
    };
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      Draggable.create(anchorRef.current, {
        inertia: true,
        cursor: "default",
        zIndexBoost: false,
        onDragStart: () => {
          chunkState.hasMoved = true;
        },
        onClick: (self) => {
          if (!self.target.classList.contains("preview-image")) return;
          handleOpenDialog();
          const itemRect = self.target.getBoundingClientRect();
          const anchorRect = document
            .querySelector("#chunks-anchor")
            ?.getBoundingClientRect();

          const targetImg = self.target as HTMLImageElement;
          const detailsImgWrapper = dialogRef.current!.querySelector(
            ".details-image-wrapper"
          )!;
          const detailsImg = detailsImgWrapper.querySelector("img")!;
          const targetImgRect = targetImg.getBoundingClientRect();

          gsap.set(detailsImgWrapper, {
            opacity: 1,
            width: targetImgRect.width,
            height: targetImgRect.height,
            scale: 0.95,
          });

          detailsImg.onload = () => {
            gsap.to(detailsImgWrapper, {
              opacity: 1,
              duration: 0.5,
              ease: "power3.out",
            });
            gsap.to(detailsImgWrapper, {
              scale: 1,
              duration: 1,
              width: 500,
              height: 700,
              delay: 0.25,
              ease: "ease.inOut",
            });
          };

          detailsImg.src = targetImg.src;

          if (anchorRect) {
            gsap.to("#chunks-anchor", {
              x:
                -(itemRect.left - anchorRect.left) +
                window.innerWidth / 2 -
                itemRect.width / 2,
              y:
                -(itemRect.top - anchorRect.top) +
                window.innerHeight / 2 -
                itemRect.height / 2,
              duration: 0.5,
              ease: "power3.out",
            });
          }
        },
      });
      gsap.set(dialogRef.current, {
        opacity: 0,
        backdropFilter: "blur(0px)",
        backgroundColor: "rgba(0, 0, 0, 0)",
      });

      Observer.create({
        target: containerRef.current,
        onWheel: (self) => {
          const currentY = gsap.getProperty(anchorRef.current, "y");
          const currentX = gsap.getProperty(anchorRef.current, "x");

          gsap.to(anchorRef.current, {
            x: Number(currentX) - self.deltaX,
            y: Number(currentY) - self.deltaY,
            duration: 1,
            ease: "power2.out",
            inertia: {
              resistance: 1000,
              velocity: Math.abs(self.deltaY + self.deltaX) * 0.006,
            },
          });
        },
      });
    },
    { scope: anchorRef }
  );

  const resetAnchorPosition = contextSafe(() => {
    gsap.set(anchorRef.current, {
      x: 0,
      y: 0,
    });
  });

  const handleOpenDialog = contextSafe(() => {
    setDetailModalOpen(true);

    gsap.to(dialogRef.current, {
      opacity: 1,
      backdropFilter: "blur(10px)",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      duration: 1,
      ease: "power3.out",
    });
  });

  const handleCloseDialog = contextSafe(() => {
    gsap.to(dialogRef.current, {
      opacity: 0,
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0, 0, 0, 0)",
      duration: 0.5,
      ease: "power3.out",
    });

    setTimeout(() => {
      setDetailModalOpen(false);
    }, 500);
  });

  useEffect(() => {
    chunkState.chunkElements.set("0,0", {
      x: 0,
      y: 0,
      startIndex: 0,
    });
  }, []);

  useEffect(() => {
    if (chunkElements.size === 0) {
      resetAnchorPosition();
      chunkState.currentIndex = 0;
      chunkState.chunkElements.set("0,0", {
        x: 0,
        y: 0,
        startIndex: 0,
      });
    }
  }, [chunkElements.size, resetAnchorPosition]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center h-screen w-screen overflow-hidden"
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
      <dialog
        open={detailModalOpen}
        className="w-screen h-screen bg-transparent"
      >
        <div
          ref={dialogRef}
          className="flex justify-center items-center w-screen h-screen"
        >
          <div
            style={{ aspectRatio: "4.5/7", width: "500px" }}
            className="details-image-wrapper overflow-hidden rounded-xl shadow-2xl shadow-white/50"
          >
            <img alt="Expanded Image" className="w-full h-full object-cover" />
          </div>
          <button
            className="absolute top-0 right-0 p-2 text-white"
            onClick={handleCloseDialog}
          >
            Close
          </button>
        </div>
      </dialog>
    </div>
  );
}

export function GridChunk({
  x,
  y,
  startIndex,
}: {
  x: number;
  y: number;
  startIndex: number;
}) {
  const chunkRef = useRef<HTMLDivElement>(null);
  const topEdgeRef = useRef<HTMLDivElement>(null);
  const rightEdgeRef = useRef<HTMLDivElement>(null);
  const bottomEdgeRef = useRef<HTMLDivElement>(null);
  const leftEdgeRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const createObserver = (
      element: HTMLDivElement | null,
      edgeName: string,
      options: IntersectionObserverInit = {
        threshold: 0.01,
      }
    ) => {
      if (!element) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          switch (edgeName) {
            case "top":
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
            case "body":
              if (loadedRef.current && !entry.isIntersecting) {
                chunkState.chunkElements.delete(`${x},${y}`);
              }
              break;
          }
        });
      }, options);

      observer.observe(element);
      observers.push(observer);
    };

    createObserver(chunkRef.current, "body", {
      rootMargin: `${CHUNK_SIZE * 2}px`,
    });
    createObserver(topEdgeRef.current, "top", {
      rootMargin: `${CHUNK_SIZE / 2}px 0px 0px 0px`,
    });
    createObserver(rightEdgeRef.current, "right", {
      rootMargin: `0px 0px 0px ${CHUNK_SIZE / 2}px`,
    });
    createObserver(bottomEdgeRef.current, "bottom", {
      rootMargin: `0px 0px ${CHUNK_SIZE / 2}px 0px`,
    });
    createObserver(leftEdgeRef.current, "left", {
      rootMargin: `0px ${CHUNK_SIZE / 2}px 0px 0px`,
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [x, y]);

  useGSAP(
    () => {
      if (chunkRef.current) {
        gsap.set(chunkRef.current, {
          width: `${CHUNK_SIZE}px`,
          height: `${CHUNK_SIZE}px`,
          x: `${x * CHUNK_SIZE}px`,
          y: `${y * CHUNK_SIZE}px`,
          onComplete: () => {
            loadedRef.current = true;
          },
        });
      }
    },
    { scope: chunkRef }
  );

  return (
    <div ref={chunkRef} className="grid-chunk">
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

function GridItem({
  index,
  large,
  small,
}: {
  index: number;
  large?: boolean;
  small?: boolean;
}) {
  const images = useSnapshot(chunkState.images);
  const itemRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const getImage = useCallback(() => {
    return images[index % images.length] ?? "/images/placeholder.png";
  }, [images, index]);

  const [url = "", color = "lightgray"] = getImage().split("?color=");

  useGSAP(
    () => {
      gsap.set(itemRef.current, {
        opacity: 0,
        scale: !chunkState.hasMoved ? 1 : 0.9,
        backgroundColor: color,
      });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            try {
              if (entry.isIntersecting) {
                gsap.to(itemRef.current, {
                  opacity: 1,
                  scale: 1,
                  backgroundColor: color,
                  duration: 1,
                  ease: "elastic.out(0.4, 0.3)",
                });

                imageRef.current!.onload = () => {
                  if (imageRef.current) {
                    gsap.to(imageRef.current, {
                      opacity: 1,
                      duration: 1,
                      delay: 0.5,
                      ease: "power1.out",
                    });
                  }
                };

                imageRef.current!.src = url;
              }
            } catch (error) {
              console.error(error);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: `${CHUNK_SIZE}px`,
        }
      );
      observer.observe(itemRef.current!);

      Observer.create({
        target: itemRef.current,
        onHover: (self) => {
          gsap.to(self.target.querySelector(".preview-image"), {
            scale: 1.1,
            duration: 1,
            ease: "power1.out",
          });
        },
        onHoverEnd: (self) => {
          gsap.to(self.target.querySelector(".preview-image"), {
            scale: 1,
            duration: 1,
            ease: "power1.out",
          });
        },
      });

      return () => {
        observer.disconnect();
      };
    },
    { scope: itemRef }
  );

  return (
    <div
      ref={itemRef}
      className={cn(
        "grid-item relative overflow-hidden",
        large && "grid-item-lg",
        small && "grid-item-sm"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        alt={`Image ${index}`}
        className="preview-image w-full h-full object-cover opacity-0"
      />
      {/* <div className="flex items-center justify-center text-2xl absolute inset-0 pointer-events-none">
        {index % images.length}
      </div> */}
    </div>
  );
}
