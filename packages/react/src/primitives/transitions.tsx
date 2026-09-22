import * as React from "react";
import { cn } from "../lib/cn";

type TransitionProps = Omit<React.ComponentPropsWithoutRef<"div">, "in"> & {
  in?: boolean;
  timeout?: number;
  unmountOnExit?: boolean;
  appear?: boolean;
};

function useTransitionVisible(open: boolean, unmountOnExit: boolean) {
  const [present, setPresent] = React.useState(open);
  React.useEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    if (!unmountOnExit) return;
    const id = window.setTimeout(() => setPresent(false), 220);
    return () => window.clearTimeout(id);
  }, [open, unmountOnExit]);
  return present;
}

function Fade({ in: open = false, unmountOnExit = false, className, children, ...props }: TransitionProps) {
  const present = useTransitionVisible(open, unmountOnExit);
  if (!present) return null;
  return (
    <div
      data-slot="fade"
      className={cn(
        "transition-opacity duration-200 ease-out",
        open ? "opacity-100" : "opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
Fade.displayName = "Fade";

function Grow({ in: open = false, unmountOnExit = false, className, children, ...props }: TransitionProps) {
  const present = useTransitionVisible(open, unmountOnExit);
  if (!present) return null;
  return (
    <div
      data-slot="grow"
      className={cn(
        "origin-center transition-[opacity,transform] duration-200 ease-out",
        open ? "scale-100 opacity-100" : "scale-90 opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
Grow.displayName = "Grow";

export type SlideProps = TransitionProps & {
  direction?: "up" | "down" | "left" | "right";
};

const slideClosed = {
  up: "translate-y-4 opacity-0",
  down: "-translate-y-4 opacity-0",
  left: "translate-x-4 opacity-0",
  right: "-translate-x-4 opacity-0",
} as const;

function Slide({
  in: open = false,
  direction = "up",
  unmountOnExit = false,
  className,
  children,
  ...props
}: SlideProps) {
  const present = useTransitionVisible(open, unmountOnExit);
  if (!present) return null;
  return (
    <div
      data-slot="slide"
      className={cn(
        "transition-[opacity,transform] duration-200 ease-out",
        open ? "translate-x-0 translate-y-0 opacity-100" : slideClosed[direction],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
Slide.displayName = "Slide";

function Zoom({ in: open = false, unmountOnExit = false, className, children, ...props }: TransitionProps) {
  const present = useTransitionVisible(open, unmountOnExit);
  if (!present) return null;
  return (
    <div
      data-slot="zoom"
      className={cn(
        "origin-center transition-[opacity,transform] duration-200 ease-out",
        open ? "scale-100 opacity-100" : "scale-75 opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
Zoom.displayName = "Zoom";

export { Fade, Grow, Slide, Zoom };
export type { TransitionProps };
