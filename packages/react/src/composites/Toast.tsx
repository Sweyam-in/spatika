import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, X } from "lucide-react";
import { cn } from "../lib/cn";

export type ToastTone = "default" | "success" | "warn" | "danger" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
  /** Single inline action, e.g. Undo. */
  action?: { label: string; onClick: () => void };
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastSeq = 0;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <Toaster />");
  return ctx;
}

const toneIcon: Record<ToastTone, ReactNode> = {
  default: null,
  success: <CheckCircle2 className="size-4 text-success-text" aria-hidden />,
  warn: <AlertTriangle className="size-4 text-warning-text" aria-hidden />,
  danger: <OctagonAlert className="size-4 text-danger-text" aria-hidden />,
  info: <Info className="size-4 text-info-text" aria-hidden />,
};

export type ToasterProps = {
  children?: ReactNode;
  className?: string;
  position?: "top-right" | "bottom-right" | "top-center" | "bottom-center";
};

/** App-level toast host + provider. Wrap the app once and call `useToast()`. */
export function Toaster({ children, className, position = "bottom-right" }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id"> & { id?: string }) => {
      const id = item.id ?? `toast-${++toastSeq}`;
      const next: ToastItem = {
        id,
        title: item.title,
        description: item.description,
        tone: item.tone ?? "default",
        durationMs: item.durationMs ?? (item.action ? 6000 : 4200),
        action: item.action,
      };
      setToasts((prev) => [...prev.filter((t) => t.id !== id), next]);
      if (next.durationMs && next.durationMs > 0) {
        timers.current.set(
          id,
          window.setTimeout(() => dismiss(id), next.durationMs),
        );
      }
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  const positionClass =
    position === "top-right"
      ? "top-4 right-4"
      : position === "top-center"
        ? "top-4 left-1/2 -translate-x-1/2"
        : position === "bottom-center"
          ? "bottom-4 left-1/2 -translate-x-1/2"
          : "bottom-4 right-4";

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section
        data-slot="toaster"
        aria-label="Notifications"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed z-[200] flex w-[min(calc(100vw-2rem),22rem)] flex-col gap-2",
          positionClass,
          className,
        )}
      >
        {toasts.map((t) => {
          const tone = t.tone ?? "default";
          return (
            <div
              key={t.id}
              data-slot="toast"
              data-tone={tone}
              role={tone === "danger" ? "alert" : "status"}
              className="spk-overlay spk-animate-toast pointer-events-auto flex items-start gap-2.5 p-3"
            >
              {toneIcon[tone] ? <span className="mt-0.5 shrink-0">{toneIcon[tone]}</span> : null}
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium text-fg">{t.title}</p>
                {t.description ? <p className="mt-0.5 text-body-sm text-fg-secondary">{t.description}</p> : null}
              </div>
              {t.action ? (
                <button
                  type="button"
                  className="spk-btn spk-btn--secondary spk-btn--xs -my-0.5 shrink-0"
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Dismiss notification"
                className="spk-btn spk-btn--ghost spk-btn--icon-xs -my-0.5 -mr-1 shrink-0 text-fg-tertiary"
                onClick={() => dismiss(t.id)}
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </section>
    </ToastContext.Provider>
  );
}
