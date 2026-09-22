import { useEffect, useState, type ReactNode } from "react";
import { Delete, X } from "lucide-react";
import { cn } from "../lib/cn";

export type PinPadProps = {
  onComplete: (pin: string) => void;
  title?: string;
  error?: string;
  loading?: boolean;
  length?: number;
  className?: string;
};

/**
 * Numeric PIN pad with dot indicators. Length, copy, and styles are customizable.
 */
export function PinPad({
  onComplete,
  title = "Enter PIN",
  error,
  loading,
  length = 6,
  className,
}: PinPadProps) {
  const [pin, setPin] = useState<string[]>([]);

  const handleNumber = (n: string) => {
    if (loading || pin.length >= length) return;
    const next = [...pin, n];
    setPin(next);
    if (next.length === length) onComplete(next.join(""));
  };

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setPin([]), 400);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (loading) return;
      if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
      if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
      if (e.key === "Escape") setPin([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"];

  return (
    <div
      data-slot="pin-pad"
      className={cn("flex w-full max-w-xs flex-col items-center gap-8", className)}
    >
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold uppercase tracking-tighter text-foreground">{title}</h2>
        {error ? <p className="text-sm font-bold text-destructive">{error}</p> : null}
      </div>
      <div className="flex gap-3">
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-4 rounded-full border-2 transition-all",
              i < pin.length
                ? "border-primary bg-primary shadow-md"
                : "border-border/60 bg-transparent",
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {keys.map((key) => {
          if (key === "clear") {
            return (
              <button
                key={key}
                type="button"
                disabled={loading}
                aria-label="Clear"
                className="flex size-16 items-center justify-center rounded-full text-destructive active:scale-95"
                onClick={() => setPin([])}
              >
                <X className="size-6" />
              </button>
            );
          }
          if (key === "del") {
            return (
              <button
                key={key}
                type="button"
                disabled={loading}
                aria-label="Delete"
                className="flex size-16 items-center justify-center rounded-full text-muted-foreground active:scale-95"
                onClick={() => setPin((p) => p.slice(0, -1))}
              >
                <Delete className="size-6" />
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              disabled={loading}
              className="flex size-16 items-center justify-center rounded-full text-2xl font-semibold text-foreground transition-colors hover:bg-muted/40 active:scale-95 active:bg-primary/20"
              onClick={() => handleNumber(key)}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type LockOverlayProps = {
  open: boolean;
  title?: string;
  error?: string;
  loading?: boolean;
  onComplete: (pin: string) => void;
  branding?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  length?: number;
};

/**
 * Full-screen lock overlay wrapping PinPad.
 */
export function LockOverlay({
  open,
  title = "Unlock",
  error,
  loading,
  onComplete,
  branding,
  secondaryAction,
  className,
  length,
}: LockOverlayProps) {
  if (!open) return null;
  return (
    <div
      data-slot="lock-overlay"
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-background/80 px-6",
        className,
      )}
    >
      {branding}
      <PinPad title={title} error={error} loading={loading} onComplete={onComplete} length={length} />
      {secondaryAction}
    </div>
  );
}
