import * as React from "react";
import { composeRefs } from "./compose-refs";

type AnyProps = Record<string, unknown>;

/**
 * Merges two prop objects, composing event handlers and classNames,
 * and merging style objects. Used by Slot for asChild composition.
 */
function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const override: AnyProps = { ...childProps };

  for (const propName of Object.keys(slotProps)) {
    const slotValue = slotProps[propName];
    const childValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotValue && childValue) {
        override[propName] = (...args: unknown[]) => {
          (childValue as (...a: unknown[]) => void)(...args);
          (slotValue as (...a: unknown[]) => void)(...args);
        };
      } else if (slotValue) {
        override[propName] = slotValue;
      }
    } else if (propName === "style") {
      override[propName] = {
        ...((slotValue as React.CSSProperties) || {}),
        ...((childValue as React.CSSProperties) || {}),
      };
    } else if (propName === "className") {
      override[propName] = [slotValue, childValue].filter(Boolean).join(" ");
    } else if (childValue === undefined) {
      override[propName] = slotValue;
    }
  }

  return override;
}

export type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

/**
 * Renders as its single React element child, merging Slot props onto that child.
 * Used for `asChild` composition on Button, Badge, and overlay triggers.
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const child = children as React.ReactElement & {
      ref?: React.Ref<HTMLElement>;
    };

    const childProps = (child.props ?? {}) as AnyProps;
    const merged = mergeProps(props as AnyProps, childProps);

    return React.cloneElement(child, {
      ...merged,
      ref: composeRefs(forwardedRef, child.ref),
    } as AnyProps);
  },
);
Slot.displayName = "Slot";
