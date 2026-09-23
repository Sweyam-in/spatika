import { useId } from "react";

type SpatikaLogoProps = {
  size?: number;
  className?: string;
};

/**
 * Spatika mark — a crystal rangoli/kolam bloom inside a glass tile.
 * Used in site header, favicon, and marketing surfaces.
 */
export function SpatikaLogo({ size = 32, className }: SpatikaLogoProps) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `spk-logo-grad-${uid}`;
  const shineId = `spk-logo-shine-${uid}`;
  const glowId = `spk-logo-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="5" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--spk-logo-saffron, #f97316)" />
          <stop offset="0.48" stopColor="var(--spk-logo-kumkum, #d9551d)" />
          <stop offset="1" stopColor="var(--spk-logo-deep, #9f3412)" />
        </linearGradient>
        <linearGradient id={shineId} x1="7" y1="5" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.45" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientTransform="matrix(18 20 -20 18 10 8)">
          <stop stopColor="white" stopOpacity="0.34" />
          <stop offset="0.62" stopColor="white" stopOpacity="0.08" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${gradientId})`} />
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${shineId})`} />
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${glowId})`} />
      <rect x="1.55" y="1.55" width="28.9" height="28.9" rx="8.45" stroke="white" strokeOpacity="0.18" />
      <path
        d="M16 5.15C18.35 8.76 18.35 10.94 16 13.28C13.65 10.94 13.65 8.76 16 5.15Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M26.85 16C23.24 18.35 21.06 18.35 18.72 16C21.06 13.65 23.24 13.65 26.85 16Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M16 26.85C13.65 23.24 13.65 21.06 16 18.72C18.35 21.06 18.35 23.24 16 26.85Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M5.15 16C8.76 13.65 10.94 13.65 13.28 16C10.94 18.35 8.76 18.35 5.15 16Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M23.67 8.33C22.78 12.54 21.24 14.08 17.94 14.08C17.94 10.76 19.46 9.22 23.67 8.33Z"
        fill="white"
        fillOpacity="0.34"
      />
      <path
        d="M23.67 23.67C19.46 22.78 17.94 21.24 17.94 17.92C21.24 17.92 22.78 19.46 23.67 23.67Z"
        fill="white"
        fillOpacity="0.34"
      />
      <path
        d="M8.33 23.67C9.22 19.46 10.76 17.92 14.06 17.92C14.06 21.24 12.54 22.78 8.33 23.67Z"
        fill="white"
        fillOpacity="0.34"
      />
      <path
        d="M8.33 8.33C12.54 9.22 14.06 10.76 14.06 14.08C10.76 14.08 9.22 12.54 8.33 8.33Z"
        fill="white"
        fillOpacity="0.34"
      />
      <path
        d="M16 5.15C18.35 8.76 18.35 10.94 16 13.28C13.65 10.94 13.65 8.76 16 5.15ZM26.85 16C23.24 18.35 21.06 18.35 18.72 16C21.06 13.65 23.24 13.65 26.85 16ZM16 26.85C13.65 23.24 13.65 21.06 16 18.72C18.35 21.06 18.35 23.24 16 26.85ZM5.15 16C8.76 13.65 10.94 13.65 13.28 16C10.94 18.35 8.76 18.35 5.15 16Z"
        stroke="white"
        strokeOpacity="0.58"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.25V22.75M9.25 16H22.75M11.22 11.22L20.78 20.78M20.78 11.22L11.22 20.78"
        stroke="white"
        strokeOpacity="0.28"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <path
        d="M16 11.6L18.2 13.8L20.4 16L18.2 18.2L16 20.4L13.8 18.2L11.6 16L13.8 13.8L16 11.6Z"
        fill="var(--background)"
        fillOpacity="0.2"
        stroke="white"
        strokeOpacity="0.78"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.05" fill="white" fillOpacity="0.92" />
      <circle cx="16" cy="6.3" r="0.85" fill="white" fillOpacity="0.62" />
      <circle cx="25.7" cy="16" r="0.85" fill="white" fillOpacity="0.62" />
      <circle cx="16" cy="25.7" r="0.85" fill="white" fillOpacity="0.62" />
      <circle cx="6.3" cy="16" r="0.85" fill="white" fillOpacity="0.62" />
    </svg>
  );
}

export function spatikaLogoSvgDataUri() {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="g" x1="5" y1="3" x2="27" y2="29"><stop stop-color="#d9551d"/><stop offset="1" stop-color="#9f3412"/></linearGradient><linearGradient id="s" x1="7" y1="5" x2="22" y2="21"><stop stop-color="white" stop-opacity=".45"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><radialGradient id="r" cx="0" cy="0" r="1" gradientTransform="matrix(18 20 -20 18 10 8)"><stop stop-color="white" stop-opacity=".34"/><stop offset=".62" stop-color="white" stop-opacity=".08"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient></defs><rect x="1" y="1" width="30" height="30" rx="9" fill="url(#g)"/><rect x="1" y="1" width="30" height="30" rx="9" fill="url(#s)"/><rect x="1" y="1" width="30" height="30" rx="9" fill="url(#r)"/><rect x="1.55" y="1.55" width="28.9" height="28.9" rx="8.45" stroke="white" stroke-opacity=".18"/><path d="M16 5.15C18.35 8.76 18.35 10.94 16 13.28C13.65 10.94 13.65 8.76 16 5.15Z" fill="white" fill-opacity=".7"/><path d="M26.85 16C23.24 18.35 21.06 18.35 18.72 16C21.06 13.65 23.24 13.65 26.85 16Z" fill="white" fill-opacity=".7"/><path d="M16 26.85C13.65 23.24 13.65 21.06 16 18.72C18.35 21.06 18.35 23.24 16 26.85Z" fill="white" fill-opacity=".7"/><path d="M5.15 16C8.76 13.65 10.94 13.65 13.28 16C10.94 18.35 8.76 18.35 5.15 16Z" fill="white" fill-opacity=".7"/><path d="M23.67 8.33C22.78 12.54 21.24 14.08 17.94 14.08C17.94 10.76 19.46 9.22 23.67 8.33Z" fill="white" fill-opacity=".34"/><path d="M23.67 23.67C19.46 22.78 17.94 21.24 17.94 17.92C21.24 17.92 22.78 19.46 23.67 23.67Z" fill="white" fill-opacity=".34"/><path d="M8.33 23.67C9.22 19.46 10.76 17.92 14.06 17.92C14.06 21.24 12.54 22.78 8.33 23.67Z" fill="white" fill-opacity=".34"/><path d="M8.33 8.33C12.54 9.22 14.06 10.76 14.06 14.08C10.76 14.08 9.22 12.54 8.33 8.33Z" fill="white" fill-opacity=".34"/><path d="M16 5.15C18.35 8.76 18.35 10.94 16 13.28C13.65 10.94 13.65 8.76 16 5.15ZM26.85 16C23.24 18.35 21.06 18.35 18.72 16C21.06 13.65 23.24 13.65 26.85 16ZM16 26.85C13.65 23.24 13.65 21.06 16 18.72C18.35 21.06 18.35 23.24 16 26.85ZM5.15 16C8.76 13.65 10.94 13.65 13.28 16C10.94 18.35 8.76 18.35 5.15 16Z" stroke="white" stroke-opacity=".58" stroke-width="1.05" stroke-linejoin="round"/><path d="M16 9.25V22.75M9.25 16H22.75M11.22 11.22L20.78 20.78M20.78 11.22L11.22 20.78" stroke="white" stroke-opacity=".28" stroke-width=".95" stroke-linecap="round"/><path d="M16 11.6L18.2 13.8L20.4 16L18.2 18.2L16 20.4L13.8 18.2L11.6 16L13.8 13.8L16 11.6Z" fill="#fff7ed" fill-opacity=".2" stroke="white" stroke-opacity=".78" stroke-width="1.1" stroke-linejoin="round"/><circle cx="16" cy="16" r="2.05" fill="white" fill-opacity=".92"/><circle cx="16" cy="6.3" r=".85" fill="white" fill-opacity=".62"/><circle cx="25.7" cy="16" r=".85" fill="white" fill-opacity=".62"/><circle cx="16" cy="25.7" r=".85" fill="white" fill-opacity=".62"/><circle cx="6.3" cy="16" r=".85" fill="white" fill-opacity=".62"/></svg>`)}`;
}
