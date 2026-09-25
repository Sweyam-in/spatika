import { useRef, type ReactNode } from "react";
import { Bell } from "lucide-react";
import { cn } from "../lib/cn";
import { useDismissLayer } from "../lib/layer-stack";
import { Button } from "../primitives/Button";
import { HeaderIconButton } from "./HeaderIconButton";

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  createdAtLabel?: string;
  isRead?: boolean;
  icon?: ReactNode;
  onOpen?: () => void;
  onDismiss?: () => void;
};

export type NotificationBellProps = {
  unreadCount?: number;
  items?: NotificationItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAll?: () => void;
  emptyState?: ReactNode;
  className?: string;
  panelClassName?: string;
  title?: string;
};

/** Notification trigger with an anchored inbox panel. */
export function NotificationBell({
  unreadCount = 0,
  items = [],
  open,
  onOpenChange,
  onMarkAll,
  emptyState,
  className,
  panelClassName,
  title = "Notifications",
}: NotificationBellProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useDismissLayer({
    enabled: open,
    refs: [rootRef],
    onEscapeKeyDown: () => {
      onOpenChange(false);
      rootRef.current?.querySelector<HTMLElement>("button[aria-haspopup]")?.focus();
    },
  });

  const label = unreadCount > 0 ? `${title}, ${unreadCount} unread` : title;

  return (
    <div ref={rootRef} data-slot="notification-bell" className={cn("relative z-20", className)}>
      <HeaderIconButton
        badge={unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined}
        active={open}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
      >
        <Bell className="size-4" />
      </HeaderIconButton>

      {open ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            className="fixed inset-0 z-[90] cursor-default"
            aria-label="Close notifications"
            onClick={() => onOpenChange(false)}
          />
          <div
            role="dialog"
            aria-label={title}
            className={cn(
              "spk-overlay spk-animate-pop absolute right-0 top-full z-[95] mt-2 w-[min(calc(100vw-1.5rem),24rem)] overflow-hidden",
              panelClassName,
            )}
            data-side="bottom"
          >
            <div className="flex h-11 items-center justify-between gap-2 border-b border-line-subtle px-3.5">
              <p className="text-title-3 text-fg">{title}</p>
              {onMarkAll && unreadCount > 0 ? (
                <Button type="button" variant="ghost" size="xs" className="text-fg-secondary" onClick={onMarkAll}>
                  Mark all read
                </Button>
              ) : null}
            </div>
            <ul className="max-h-96 overflow-y-auto p-1">
              {items.length === 0 ? (
                <li>
                  {emptyState ?? (
                    <p className="px-4 py-10 text-center text-body text-fg-secondary">You’re all caught up.</p>
                  )}
                </li>
              ) : (
                items.map((item) => (
                  <li
                    key={item.id}
                    className="relative flex gap-3 rounded-[calc(var(--spk-radius-md)-0.25rem)] px-2.5 py-2.5 transition-colors duration-[var(--spk-duration-fast)] hover:bg-hover"
                  >
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[var(--spk-radius-sm)] bg-surface-subtle text-fg-secondary [&_svg]:size-3.5">
                      {item.icon ?? <Bell />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className={cn("min-w-0 flex-1 text-body", item.isRead ? "text-fg-secondary" : "font-medium text-fg")}>
                          {item.title}
                        </p>
                        {!item.isRead ? (
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-solid">
                            <span className="sr-only">Unread</span>
                          </span>
                        ) : null}
                      </div>
                      {item.body ? <p className="mt-0.5 line-clamp-2 text-body-sm text-fg-secondary">{item.body}</p> : null}
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-caption">
                        {item.createdAtLabel ? <span className="text-fg-tertiary">{item.createdAtLabel}</span> : null}
                        {item.onOpen ? (
                          <button type="button" className="spk-btn spk-btn--link text-caption" onClick={item.onOpen}>
                            Open
                          </button>
                        ) : null}
                        {item.onDismiss ? (
                          <button
                            type="button"
                            className="spk-btn spk-btn--link text-caption text-fg-tertiary hover:text-fg"
                            onClick={item.onDismiss}
                          >
                            Dismiss
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
