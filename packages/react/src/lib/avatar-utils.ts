/**
 * Stable avatar tint derived from a name hash. Tints are soft token mixes (not saturated
 * fills) so initials read well in every theme and never compete with content.
 */
const AVATAR_TINTS = [
  "bg-[color-mix(in_oklab,var(--spk-viz-1)_16%,var(--spk-surface))] text-[color-mix(in_oklab,var(--spk-viz-1)_78%,var(--spk-text-primary))]",
  "bg-[color-mix(in_oklab,var(--spk-viz-2)_16%,var(--spk-surface))] text-[color-mix(in_oklab,var(--spk-viz-2)_70%,var(--spk-text-primary))]",
  "bg-[color-mix(in_oklab,var(--spk-viz-3)_18%,var(--spk-surface))] text-[color-mix(in_oklab,var(--spk-viz-3)_62%,var(--spk-text-primary))]",
  "bg-[color-mix(in_oklab,var(--spk-viz-4)_16%,var(--spk-surface))] text-[color-mix(in_oklab,var(--spk-viz-4)_76%,var(--spk-text-primary))]",
  "bg-[color-mix(in_oklab,var(--spk-viz-6)_16%,var(--spk-surface))] text-[color-mix(in_oklab,var(--spk-viz-6)_74%,var(--spk-text-primary))]",
  "bg-[color-mix(in_oklab,var(--spk-viz-7)_16%,var(--spk-surface))] text-[color-mix(in_oklab,var(--spk-viz-7)_70%,var(--spk-text-primary))]",
  "bg-[color-mix(in_oklab,var(--spk-viz-8)_18%,var(--spk-surface))] text-[color-mix(in_oklab,var(--spk-viz-8)_66%,var(--spk-text-primary))]",
  "bg-[color-mix(in_oklab,var(--spk-viz-5)_18%,var(--spk-surface))] text-[color-mix(in_oklab,var(--spk-viz-5)_70%,var(--spk-text-primary))]",
];

function hashName(name: string): number {
  let hash = 0;
  const safeName = name || "User";
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getAvatarColor(name: string): string {
  return AVATAR_TINTS[hashName(name) % AVATAR_TINTS.length]!;
}

/** Stable 0–359 hue from a display name — used to tint generated covers. */
export function getAvatarFallbackHue(name: string): number {
  return hashName(name) % 360;
}

/** First two initials from a display name (uppercase). */
export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
