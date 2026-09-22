import * as React from "react";

type UseControllableStateParams<T> = {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
};

/**
 * Controlled/uncontrolled state helper (Radix-style).
 * When `prop` is provided the state is controlled; otherwise it uses local state.
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolled;

  const setValue = React.useCallback(
    (next: T | ((prev: T | undefined) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T | undefined) => T)(value)
          : next;

      if (!isControlled) {
        setUncontrolled(resolved);
      }
      onChange?.(resolved);
    },
    [isControlled, onChange, value],
  );

  return [value, setValue];
}
