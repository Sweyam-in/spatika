import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "../lib/cn";
import { useDismissLayer } from "../lib/layer-stack";
import { OVERLAY_Z_INDEX } from "../lib/overlay-stack";
import { Portal } from "../lib/portal";
import { useFocusTrap } from "../lib/use-focus-trap";
import { Button } from "../primitives/Button";

export type PhotoViewerItem = {
  src: string;
  alt?: string;
  caption?: string;
};

export type PhotoViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PhotoViewerItem[];
  index?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
};

/**
 * Full-screen photo viewer / lightbox with zoom and prev/next.
 */
export function PhotoViewer({
  open,
  onOpenChange,
  items,
  index: controlledIndex,
  onIndexChange,
  className,
}: PhotoViewerProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const index = controlledIndex ?? internalIndex;

  const setIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, next));
      setInternalIndex(clamped);
      onIndexChange?.(clamped);
      setZoom(1);
    },
    [items.length, onIndexChange],
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const active = open && items.length > 0;
  useFocusTrap(rootRef, active);
  useDismissLayer({ enabled: active, refs: [rootRef], onEscapeKeyDown: () => onOpenChange(false) });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setIndex(index - 1);
      if (e.key === "ArrowRight") setIndex(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, onOpenChange, setIndex]);

  if (!open || items.length === 0) return null;
  const item = items[index];

  return (
    <Portal>
      <div
        ref={rootRef}
        data-slot="photo-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={item?.alt || "Photo viewer"}
        tabIndex={-1}
        className={cn("fixed inset-0 flex flex-col bg-black/90 outline-none", className)}
        style={{ zIndex: OVERLAY_Z_INDEX.modal }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2 text-white">
          <p className="truncate text-sm font-bold">
            {index + 1} / {items.length}
            {item?.caption ? ` · ${item.caption}` : ""}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              aria-label="Zoom out"
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              aria-label="Zoom in"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-12">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-2 text-white hover:bg-white/10"
            disabled={index <= 0}
            onClick={() => setIndex(index - 1)}
            aria-label="Previous"
          >
            <ChevronLeft className="size-6" />
          </Button>
          {item ? (
            <img
              src={item.src}
              alt={item.alt || ""}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              draggable={false}
            />
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 text-white hover:bg-white/10"
            disabled={index >= items.length - 1}
            onClick={() => setIndex(index + 1)}
            aria-label="Next"
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>
      </div>
    </Portal>
  );
}
