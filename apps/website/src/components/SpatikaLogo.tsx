type SpatikaLogoProps = {
  size?: number;
  className?: string;
};

/**
 * Spatika mark — a crystal (स्फटिक) facet inside a glass tile.
 * Used in site header, favicon, and marketing surfaces.
 */
export function SpatikaLogo({ size = 32, className }: SpatikaLogoProps) {
  const id = "spk-logo-grad";
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
        <linearGradient id={id} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--accent-highlight, var(--primary))" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="8" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.45" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <rect width="32" height="32" rx="9" fill={`url(#${id}-shine)`} />
      <path
        d="M16 6.5L24.5 11.25V20.75L16 25.5L7.5 20.75V11.25L16 6.5Z"
        fill="white"
        fillOpacity="0.12"
        stroke="white"
        strokeOpacity="0.85"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 6.5L7.5 11.25L16 16L24.5 11.25L16 6.5Z" fill="white" fillOpacity="0.28" />
      <path d="M16 6.5V25.5" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
      <path d="M7.5 11.25H24.5" stroke="white" strokeOpacity="0.28" strokeWidth="1" />
    </svg>
  );
}

export function spatikaLogoSvgDataUri() {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="g" x1="4" y1="4" x2="28" y2="28"><stop stop-color="%232563eb"/><stop offset="1" stop-color="%237c3aed"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(%23g)"/><path d="M16 6.5L24.5 11.25V20.75L16 25.5L7.5 20.75V11.25L16 6.5Z" fill="white" fill-opacity=".12" stroke="white" stroke-opacity=".85" stroke-width="1.4" stroke-linejoin="round"/><path d="M16 6.5L7.5 11.25L16 16L24.5 11.25L16 6.5Z" fill="white" fill-opacity=".28"/><path d="M16 6.5V25.5" stroke="white" stroke-opacity=".4"/><path d="M7.5 11.25H24.5" stroke="white" stroke-opacity=".28"/></svg>`)}`;
}
