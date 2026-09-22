import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "../lib/cn";
import {
  coverFloatingIconClass,
  coverMutedClass,
  coverPlateClass,
  coverTitleClass,
} from "../lib/cover-chrome";
import {
  getCoverPattern,
  type CoverPatternKind,
} from "../lib/cover-pattern";
import { useCoverChromeBleed } from "../lib/use-cover-chrome-bleed";
import { getInitials } from "../lib/avatar-utils";
import { CoverPattern } from "./CoverPattern";

export type CoverHeroAvatar = {
  name: string;
  src?: string;
  href?: string;
  onClick?: () => void;
};

export type CoverHeroFact = {
  key: string;
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  wide?: boolean;
  muted?: boolean;
};

export type CoverHeroProps = {
  title: string;
  kicker?: ReactNode;
  facts?: CoverHeroFact[];
  avatars?: CoverHeroAvatar[];
  hiddenAvatarCount?: number;
  coverUrl?: string;
  hideImages?: boolean;
  coverSeed?: string;
  coverHue?: number;
  coverKind?: CoverPatternKind | null;
  dark?: boolean;
  warm?: boolean;
  /** Profile bleeds into a tab bar; story ends at the identity plate. */
  variant?: "story" | "profile";
  onBack?: () => void;
  backLabel?: string;
  floatingActions?: ReactNode;
  compactActions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Offset used when the compact bar pins under app chrome. */
  compactOffsetClassName?: string;
  /** When false, keep the cover inside this frame (docs / device previews). */
  bleed?: boolean;
};

/**
 * Cover hero — generated / photo cover that bleeds into app chrome, floating
 * glass controls, a notched identity plate, and a compact sticky bar once the
 * hero scrolls away. Mirrors journalD StoryCoverHeader / Profile hero.
 */
export function CoverHero({
  title,
  kicker,
  facts,
  avatars = [],
  hiddenAvatarCount = 0,
  coverUrl,
  hideImages,
  coverSeed,
  coverHue = 210,
  coverKind,
  dark,
  warm,
  variant = "story",
  onBack,
  backLabel = "Go back",
  floatingActions,
  compactActions,
  children,
  className,
  compactOffsetClassName = "top-16",
  bleed = true,
}: CoverHeroProps) {
  const seed = coverSeed ?? title;
  const scene = getCoverPattern({ seed, hue: coverHue, dark, warm, kind: coverKind });
  const onDarkCover = scene.headerInk === "light";
  const mediaClass = variant === "profile" ? "cover-media cover-media--profile" : "cover-media cover-media--story";

  const visibleAvatars = avatars.slice(0, 3);
  const extra = Math.max(0, hiddenAvatarCount || avatars.length - visibleAvatars.length);
  const avatarCount = visibleAvatars.length + (extra > 0 ? 1 : 0);
  const hasAvatars = avatarCount > 0;

  const heroRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const [coverUnderChrome, setCoverUnderChrome] = useState(true);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const hero = heroRef.current;
      const plate = plateRef.current;
      if (!hero || !plate) return;
      const chromeHeight =
        document.querySelector<HTMLElement>(".app-chrome-header")?.offsetHeight ?? 64;
      const heroRect = hero.getBoundingClientRect();
      if (heroRect.height === 0) return;
      setCoverUnderChrome(plate.getBoundingClientRect().top > chromeHeight + 1);
      setHeroInView(heroRect.bottom > chromeHeight + 1);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useCoverChromeBleed(bleed && coverUnderChrome, scene.chromeInk);

  return (
    <>
      <header
        ref={heroRef}
        data-slot="cover-hero"
        data-cover-bleed={bleed ? "true" : undefined}
        className={cn(
          "relative z-10 w-full",
          bleed ? "overflow-visible" : "overflow-hidden rounded-[var(--spk-radius-lg)]",
          className,
        )}
      >
        <div className={cn(mediaClass, bleed && "sm:rounded-b-[1.75rem]")} aria-hidden>
          {!hideImages && coverUrl ? (
            <img src={coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <CoverPattern seed={seed} hue={coverHue} dark={dark} warm={warm} kind={coverKind} />
          )}
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/[0.04] to-transparent dark:from-black/12" />
          <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/[0.03] via-transparent to-transparent dark:from-black/10" />
        </div>

        <div className="relative z-10 flex flex-col">
          <div className="relative min-h-[8.5rem] sm:min-h-[10.5rem] lg:min-h-[12rem]">
            <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-3 sm:px-5 sm:pt-4">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label={backLabel}
                  data-cover-ink={scene.headerInk}
                  className={cn(
                    "cover-floating-shell flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors active:scale-[0.96]",
                    onDarkCover ? "text-white hover:bg-black/60" : "text-zinc-900 hover:bg-white/90",
                  )}
                >
                  <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Back</span>
                </button>
              ) : (
                <span />
              )}
              {floatingActions ? (
                <div
                  data-cover-ink={scene.headerInk}
                  className="cover-floating-shell flex items-center gap-1 p-1"
                >
                  {floatingActions}
                </div>
              ) : null}
            </div>
          </div>

          <div ref={plateRef} className="relative z-20 px-3.5 pb-4 sm:px-5 sm:pb-5 lg:px-8 lg:pb-6">
            <div
              className="cover-identity story-identity"
              style={{ "--story-avatar-count": avatarCount } as CSSProperties}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-[var(--spk-radius-lg)]",
                  hasAvatars && "cover-identity__plate story-identity__plate",
                  coverPlateClass(scene.headerInk),
                )}
              />
              <div
                className={cn(
                  "relative z-10 flex flex-col items-center px-3 pb-3 text-center sm:px-6 sm:pb-4",
                  hasAvatars ? "pt-0" : "pt-3 sm:pt-4",
                )}
              >
                {hasAvatars ? (
                  <div className="cover-identity__avatars story-identity__avatars">
                    <div className="flex -space-x-5 sm:-space-x-6">
                      {visibleAvatars.map((avatar, index) => {
                        const body = (
                          <span
                            style={{
                              width: "var(--story-avatar-size)",
                              height: "var(--story-avatar-size)",
                            }}
                            className="flex items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-muted text-lg font-semibold text-primary shadow-md dark:border-white/30"
                          >
                            {!hideImages && avatar.src ? (
                              <img src={avatar.src} alt="" className="size-full object-cover" />
                            ) : (
                              getInitials(avatar.name)
                            )}
                          </span>
                        );
                        return (
                          <span
                            key={avatar.name + index}
                            style={{ zIndex: visibleAvatars.length - index }}
                            className="relative"
                          >
                            {avatar.href ? (
                              <a
                                href={avatar.href}
                                onClick={avatar.onClick}
                                title={avatar.name}
                                aria-label={avatar.name}
                                className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              >
                                {body}
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={avatar.onClick}
                                title={avatar.name}
                                aria-label={avatar.name}
                                className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              >
                                {body}
                              </button>
                            )}
                          </span>
                        );
                      })}
                      {extra > 0 ? (
                        <span
                          style={{
                            width: "var(--story-avatar-size)",
                            height: "var(--story-avatar-size)",
                          }}
                          className="relative z-0 flex items-center justify-center rounded-full border-[3px] border-white bg-zinc-900/80 text-base font-semibold text-white dark:border-white/30"
                        >
                          +{extra}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className={cn("w-full min-w-0", hasAvatars && "mt-2 sm:mt-2.5")}>
                  {kicker ? (
                    <div className="flex flex-wrap items-center justify-center gap-1.5">{kicker}</div>
                  ) : null}
                  <h1
                    className={cn(
                      "mt-2 text-balance text-[1.15rem] font-semibold leading-tight tracking-tight sm:text-[1.35rem] lg:text-[1.65rem]",
                      coverTitleClass(scene.headerInk),
                    )}
                  >
                    {title}
                  </h1>
                  {facts && facts.length > 0 ? (
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6">
                      {facts.map((fact) => (
                        <div
                          key={fact.key}
                          className={cn(
                            "flex min-w-0 items-center justify-center gap-2",
                            fact.wide && "col-span-2 sm:col-span-1",
                          )}
                        >
                          {fact.icon ? (
                            <span
                              className={cn(
                                "hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border backdrop-blur-md sm:flex",
                                onDarkCover
                                  ? "border-white/20 bg-white/15 text-white/90"
                                  : "border-zinc-950/10 bg-zinc-950/[0.06] text-zinc-700",
                              )}
                            >
                              {fact.icon}
                            </span>
                          ) : null}
                          <div className="min-w-0 text-center sm:text-left">
                            <dt
                              className={cn(
                                "text-caption font-medium text-fg-tertiary",
                                coverMutedClass(scene.headerInk),
                              )}
                            >
                              {fact.label}
                            </dt>
                            <dd
                              className={cn(
                                "truncate text-[11px] font-bold sm:text-xs",
                                coverTitleClass(scene.headerInk),
                                fact.muted && "opacity-60",
                              )}
                            >
                              {fact.value}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {bleed ? (
        <div className={cn("sticky z-[60] h-0", compactOffsetClassName)}>
          {!heroInView ? (
            <div className="glass-header cover-chrome-bar absolute inset-x-0 top-0 border-b border-border/50 bg-background/85 backdrop-blur-md dark:bg-background/94">
              <div className="app-frame-pad flex items-center gap-2 py-1.5 sm:py-2">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    aria-label={backLabel}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
                <h2 className="page-header-title min-w-0 flex-1 truncate">{title}</h2>
                {compactActions}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export { coverFloatingIconClass };
