import * as React from "react";
import { cn } from "../lib/cn";
import { nativeSelectSizeClass, type NativeSelectSize } from "../lib/chips";

export type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  /**
   * Visual size. `default` stays full-width for forms.
   * `sm` is a compact pill for toolbars. `touch` is a 44px target.
   * Omits the native HTML `size` (visible option rows) to avoid the clash.
   */
  size?: NativeSelectSize;
};

/**
 * Styled native `<select>` — prefer compound `Select` for custom menus.
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, size = "default", children, ...props }, ref) => (
    <select
      ref={ref}
      data-slot="native-select"
      data-size={size}
      className={cn(nativeSelectSizeClass(size), className)}
      {...props}
    >
      {children}
    </select>
  ),
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
