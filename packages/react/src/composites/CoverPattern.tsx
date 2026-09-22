import { useMemo } from "react";
import { cn } from "../lib/cn";
import {
  getCoverPattern,
  type CoverPatternInput,
} from "../lib/cover-pattern";

export type CoverPatternProps = CoverPatternInput & {
  className?: string;
};

/**
 * Seeded nature-inspired cover when no cover photo is set.
 * Scene kind is unique per seed; colors follow hue + theme.
 */
export function CoverPattern({
  seed,
  hue,
  secondaryHue,
  tertiaryHue,
  dark,
  warm,
  kind,
  className,
}: CoverPatternProps) {
  const scene = useMemo(
    () => getCoverPattern({ seed, hue, secondaryHue, tertiaryHue, dark, warm, kind }),
    [seed, hue, secondaryHue, tertiaryHue, dark, warm, kind],
  );

  return (
    <div
      data-cover-pattern={scene.kind}
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="absolute inset-0 transition-[background-color,background-image] duration-700 ease-out"
        style={scene.skyStyle}
      />
      <svg
        viewBox="0 0 1600 420"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        {scene.ellipses.map((ellipse, index) => (
          <ellipse
            key={`e-${scene.uid}-${index}`}
            cx={ellipse.cx}
            cy={ellipse.cy}
            rx={ellipse.rx}
            ry={ellipse.ry}
            fill={ellipse.fill}
            opacity={ellipse.opacity}
          />
        ))}
        {scene.circles.map((circle, index) => (
          <circle
            key={`c-${scene.uid}-${index}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill={circle.fill}
            opacity={circle.opacity}
          />
        ))}
        {scene.paths.map((path, index) => (
          <path
            key={`p-${scene.uid}-${index}`}
            d={path.d}
            fill={path.fill}
            opacity={path.opacity}
          />
        ))}
        {scene.polygons.map((polygon, index) => (
          <polygon
            key={`g-${scene.uid}-${index}`}
            points={polygon.points}
            fill={polygon.fill}
            opacity={polygon.opacity}
          />
        ))}
      </svg>
      <div className="profile-cover-grain pointer-events-none absolute inset-0" />
    </div>
  );
}

/** @deprecated Use CoverPattern — kept as the journalD name. */
export const ProfileCoverPattern = CoverPattern;
