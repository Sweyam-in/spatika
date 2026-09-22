import * as React from "react";
import { composeRefs } from "../lib/compose-refs";

export type ClickAwayListenerProps = {
  onClickAway: (event: MouseEvent | TouchEvent) => void;
  children: React.ReactElement;
  mouseEvent?: "mousedown" | "mouseup" | "click" | false;
  touchEvent?: "touchstart" | "touchend" | false;
};

/**
 * Invokes `onClickAway` when a pointer event occurs outside the child.
 */
function ClickAwayListener({
  onClickAway,
  children,
  mouseEvent = "mousedown",
  touchEvent = "touchstart",
}: ClickAwayListenerProps) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;
      const target = event.target as Node | null;
      if (!node || !target || node.contains(target)) return;
      onClickAway(event);
    };

    if (mouseEvent) document.addEventListener(mouseEvent, handler);
    if (touchEvent) document.addEventListener(touchEvent, handler);
    return () => {
      if (mouseEvent) document.removeEventListener(mouseEvent, handler);
      if (touchEvent) document.removeEventListener(touchEvent, handler);
    };
  }, [onClickAway, mouseEvent, touchEvent]);

  const childRef = (children as { ref?: React.Ref<HTMLElement> }).ref;

  return React.cloneElement(children, {
    ref: composeRefs(ref, childRef),
  } as Partial<unknown>);
}
ClickAwayListener.displayName = "ClickAwayListener";

export { ClickAwayListener };
