import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { getInitials } from "../lib/avatar-utils";
import {
  coverMutedClass,
  coverPlateClass,
  coverTitleClass,
} from "../lib/cover-chrome";
import { getCoverPattern, type CoverPatternKind } from "../lib/cover-pattern";
import { CoverPattern } from "./CoverPattern";

export type ProfileHeroProps = {
  name: string;
  alias?: string;
  coverUrl?: string;
  avatarUrl?: string;
  hideImages?: boolean;
  statusBadges?: ReactNode;
  metaLines?: ReactNode;
  stats?: ReactNode;
  tags?: ReactNode;
  topLeading?: ReactNode;
  topActions?: ReactNode;
  avatarAccessory?: ReactNode;
  onAvatarClick?: () => void;
  className?: string;
  coverClassName?: string;
  identityClassName?: string;
  children?: ReactNode;
  /** Seed for the generated cover when no photo is set. */
  coverSeed?: string;
  coverHue?: number;
  coverKind?: CoverPatternKind | null;
  dark?: boolean;
  warm?: boolean;
  /** When false, keep the cover inside this frame (catalog previews). */
  bleed?: boolean;
};

/**
 * Profile / entity hero: cover fills the frame, overlapping avatar notches
 * the frosted identity plate. Stacked in a narrow column; left-notched once
 * the plate is wide enough (container query, not viewport).
 */
export function ProfileHero({
  name,
  alias,
  coverUrl,
  avatarUrl,
  hideImages,
  statusBadges,
  metaLines,
  stats,
  tags,
  topLeading,
  topActions,
  avatarAccessory,
  onAvatarClick,
  className,
  coverClassName,
  identityClassName,
  children,
  coverSeed,
  coverHue = 210,
  coverKind,
  dark,
  warm,
  bleed = true,
}: ProfileHeroProps) {
  const initials = getInitials(name);
  const seed = coverSeed ?? name;
  const scene = getCoverPattern({ seed, hue: coverHue, dark, warm, kind: coverKind });
  const ink = scene.headerInk;

  return (
    <div
      data-slot="profile-hero"
      data-cover-bleed={bleed ? "true" : undefined}
      className={cn(
        "relative w-full",
        bleed ? "overflow-visible" : "overflow-hidden rounded-[var(--spk-radius-lg)]",
        className,
      )}
    >
      <div
        className={cn("cover-media cover-media--profile", bleed && "sm:rounded-b-[2rem]")}
        aria-hidden
      >
        {!hideImages && coverUrl ? (
          <img src={coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <CoverPattern seed={seed} hue={coverHue} dark={dark} warm={warm} kind={coverKind} />
        )}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/[0.04] to-transparent dark:from-black/12" />
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/[0.03] via-transparent to-transparent dark:from-black/10" />
      </div>

      <div className="relative z-10 flex flex-col">
        <div
          className={cn(
            "relative min-h-[8.5rem] sm:min-h-[11rem] lg:min-h-[12rem]",
            coverClassName,
          )}
        >
          <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-3 sm:p-4">
            <div>{topLeading}</div>
            {topActions ? (
              <div
                data-cover-ink={ink}
                className="cover-floating-shell flex items-center gap-1 p-1"
              >
                {topActions}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative z-20 px-3 pb-4 sm:px-4 sm:pb-5 lg:px-6">
          <div className={cn("profile-identity", identityClassName)}>
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 rounded-[var(--spk-radius-lg)] profile-identity__plate",
                coverPlateClass(ink),
              )}
            />
            <div className="profile-identity__body">
              <button
                type="button"
                disabled={!onAvatarClick}
                onClick={onAvatarClick}
                aria-label={name}
                className="profile-identity__avatar"
              >
                <span
                  className="flex items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-muted text-lg font-semibold leading-none text-primary shadow-md dark:border-white/30"
                  style={{
                    width: "var(--profile-avatar-size)",
                    height: "var(--profile-avatar-size)",
                  }}
                >
                  {!hideImages && avatarUrl ? (
                    <img src={avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                {avatarAccessory}
              </button>
              <div className="profile-identity__copy">
                <div className="profile-identity__heading">
                  <h1
                    className={cn(
                      "truncate text-[1.15rem] font-semibold leading-tight tracking-tight sm:text-2xl",
                      coverTitleClass(ink),
                    )}
                  >
                    {name}
                  </h1>
                  {statusBadges}
                </div>
                {alias ? (
                  <p className={cn("mt-0.5 truncate text-sm font-medium", coverMutedClass(ink))}>
                    {alias}
                  </p>
                ) : null}
                {metaLines ? (
                  <div className={cn("mt-2 space-y-1 text-sm", coverMutedClass(ink))}>{metaLines}</div>
                ) : null}
                {stats ? <div className="mt-3">{stats}</div> : null}
                {tags ? <div className="profile-identity__tags">{tags}</div> : null}
              </div>
            </div>
            {children ? <div className="relative z-10 px-3 pb-3 sm:px-6">{children}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
