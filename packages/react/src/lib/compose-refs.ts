import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

/** Assigns a value to a React ref (callback or object ref). */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref != null) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

/** Merges multiple refs into a single callback ref. */
export function composeRefs<T>(...refs: PossibleRef<T>[]) {
  return (node: T) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}
