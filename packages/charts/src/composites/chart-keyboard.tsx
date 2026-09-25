import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import type { ChartHover, ChartTooltipItem } from "./chart-interaction";

/**
 * Keyboard access to a chart's data points, shared by every chart surface.
 *
 * The plot is one tab stop. Arrow keys move between marks — ← → along a series (or through the
 * slices of a pie), ↑ ↓ between series at the same category — Home / End jump to the ends,
 * Enter / Space activate the mark (`onItemClick`), Escape clears. The focused point shows the
 * same tooltip a pointer would and is announced through a polite live region, so values are
 * reachable without a mouse and without leaving the chart for its data table.
 *
 * Marks opt in through `bindChartMark`, which stamps them with `data-chart-series`,
 * `data-chart-index` and the tooltip content in `data-chart-hover`.
 */

type MarkHover = { title?: string; items: ChartTooltipItem[] };

type Mark = { el: Element; series: string; index: number; hover: MarkHover };

function readMarks(surface: HTMLElement): Mark[] {
  const marks = readRawMarks(surface);
  // Pies (one "series" per slice so the legend can toggle it) and similar charts: when no series
  // has a second mark, walk every mark as one sequence in drawing order.
  const counts = new Map<string, number>();
  for (const mark of marks) counts.set(mark.series, (counts.get(mark.series) ?? 0) + 1);
  if (marks.length > 1 && [...counts.values()].every((count) => count === 1)) {
    return marks.map((mark, index) => ({ ...mark, series: "", index }));
  }
  return marks;
}

function readRawMarks(surface: HTMLElement): Mark[] {
  return Array.from(surface.querySelectorAll("[data-chart-hover]")).flatMap((el) => {
    try {
      const hover = JSON.parse(el.getAttribute("data-chart-hover") ?? "") as MarkHover;
      return [
        {
          el,
          series: el.getAttribute("data-chart-series") ?? "",
          index: Number(el.getAttribute("data-chart-index") ?? 0),
          hover,
        },
      ];
    } catch {
      return [];
    }
  });
}

function keyOf(mark: Pick<Mark, "series" | "index">) {
  return `${mark.series}\u0000${mark.index}`;
}

export function describeMark(hover: MarkHover) {
  const values = hover.items.map((item) => (item.label && item.label !== hover.title ? `${item.label} ${item.value}` : item.value)).join(", ");
  return hover.title ? `${hover.title}: ${values}` : values;
}

export function useChartKeyboard(
  surfaceRef: RefObject<HTMLElement | null>,
  { disabled = false, label = "Data points" }: { disabled?: boolean; label?: string } = {},
) {
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<ChartHover>(null);
  const [announcement, setAnnouncement] = useState("");
  // Charts that draw no navigable marks (gauges, some flow charts) get no tab stop or hint.
  const [hasMarks, setHasMarks] = useState(false);
  const hintId = useId();
  const activeRef = useRef<string | null>(null);

  const show = useCallback(
    (mark: Mark | null, position?: { at: number; of: number }) => {
      const surface = surfaceRef.current;
      activeRef.current = mark ? keyOf(mark) : null;
      setActive(activeRef.current);
      if (!mark || !surface) {
        setHover(null);
        return;
      }
      const box = mark.el.getBoundingClientRect();
      const frame = surface.getBoundingClientRect();
      setHover({
        x: box.left + box.width / 2 - frame.left,
        y: Math.max(0, box.top - frame.top),
        title: mark.hover.title,
        items: mark.hover.items,
        dataIndex: mark.index,
        seriesId: mark.series,
      });
      setAnnouncement(`${describeMark(mark.hover)}${position ? `. ${position.at} of ${position.of}` : ""}`);
    },
    [surfaceRef],
  );

  // Marks re-render (hover, animation, legend toggles); keep the active flag on the right element.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    // Nothing to navigate, or hidden from assistive tech by the page (aria-hidden must not
    // contain focusable elements).
    const found =
      surface.querySelector("[data-chart-hover]") !== null && surface.closest('[aria-hidden="true"], [inert]') === null;
    if (found !== hasMarks) setHasMarks(found);
    for (const el of Array.from(surface.querySelectorAll("[data-chart-active]"))) el.removeAttribute("data-chart-active");
    if (!active) return;
    const mark = readMarks(surface).find((item) => keyOf(item) === active);
    if (mark) mark.el.setAttribute("data-chart-active", "");
    else show(null); // its series was hidden
  });

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const surface = surfaceRef.current;
    if (!enabled || !surface || event.target !== event.currentTarget) return;
    const marks = readMarks(surface);
    if (!marks.length) return;
    const series = [...new Set(marks.map((mark) => mark.series))];
    const current = marks.find((mark) => keyOf(mark) === activeRef.current) ?? null;
    const inSeries = (id: string) => marks.filter((mark) => mark.series === id).sort((a, b) => a.index - b.index);
    const place = (mark: Mark) => {
      const list = inSeries(mark.series);
      show(mark, { at: list.indexOf(mark) + 1, of: list.length });
    };

    let next: Mark | undefined;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowLeft": {
        const list = inSeries(current?.series ?? series[0]!);
        const at = current ? list.indexOf(current) : -1;
        next = current ? list[at + (event.key === "ArrowRight" ? 1 : -1)] : list[event.key === "ArrowRight" ? 0 : list.length - 1];
        break;
      }
      case "ArrowDown":
      case "ArrowUp": {
        if (!current) {
          next = inSeries(series[0]!)[0];
          break;
        }
        // Next series that has a mark at this category (or the nearest one).
        const order = series.indexOf(current.series);
        const step = event.key === "ArrowDown" ? 1 : -1;
        for (let i = order + step; i >= 0 && i < series.length; i += step) {
          const list = inSeries(series[i]!);
          next = list.find((mark) => mark.index === current.index) ?? list[0];
          if (next) break;
        }
        break;
      }
      case "Home":
        next = inSeries(current?.series ?? series[0]!)[0];
        break;
      case "End": {
        const list = inSeries(current?.series ?? series[0]!);
        next = list[list.length - 1];
        break;
      }
      case "Enter":
      case " ":
        if (!current) return;
        event.preventDefault();
        current.el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        return;
      case "Escape":
        if (!current) return;
        event.preventDefault();
        show(null);
        setAnnouncement("");
        return;
      default:
        return;
    }
    event.preventDefault();
    if (next) place(next);
  };

  const enabled = !disabled && hasMarks;
  const surfaceProps = !enabled
    ? {}
    : {
        tabIndex: 0,
        role: "group" as const,
        "aria-label": label,
        "aria-roledescription": "chart plot",
        "aria-describedby": hintId,
        onKeyDown,
        onBlur: (event: { currentTarget: HTMLElement; relatedTarget: EventTarget | null }) => {
          if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
          show(null);
        },
      };

  const liveRegion = !enabled ? null : (
    <>
      <span id={hintId} className="spk-chart-a11y">
        Use the arrow keys to move between data points.
      </span>
      <span className="spk-chart-a11y" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </>
  );

  return { hover, surfaceProps, liveRegion };
}
