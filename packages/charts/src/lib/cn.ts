import { clsx, type ClassValue } from "clsx";

/** Compose Spatika class names while ignoring falsy values. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
