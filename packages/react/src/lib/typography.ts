/**
 * Named typography roles. Hierarchy comes from size and weight — not uppercase shouting.
 * Spatika utilities map to the `--spk-text-*` scale in `@spatika/tokens`.
 */

export const typographyDisplay = "text-display text-fg";
export const typographyTitle1 = "text-title-1 text-fg";
export const typographyTitle2 = "text-title-2 text-fg";
export const typographyTitle3 = "text-title-3 text-fg";
export const typographyBody = "text-body text-fg";
export const typographyBodySecondary = "text-body text-fg-secondary";
export const typographyLabel = "text-label font-medium text-fg";
export const typographyCaption = "text-caption text-fg-tertiary";
export const typographyOverline = "text-overline uppercase text-fg-tertiary";
export const typographyNumeric = "spk-numeric";
export const typographyCode = "font-mono text-[length:var(--spk-text-code)]";

/** Small group / section label. Sentence case, quiet. */
export const typographyEyebrow = "text-caption font-medium text-fg-tertiary";

/** Band / marketing eyebrow — accent text, not a gradient. */
export const typographyBandEyebrow = "text-label font-medium text-accent-text";

/** Compact card / filter section title. */
export const typographySectionLabel = "text-caption font-medium text-fg-secondary";

/** Page title. */
export const typographyPageTitle = "text-title-1 text-fg";

/** Supporting copy under titles. */
export const typographyPageSubtitle = "text-body text-fg-secondary";

/** Dense body used in admin / settings panels. */
export const typographyBodyDense = "text-body-sm text-fg";
