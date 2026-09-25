import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  CartesianGrid,
  CategoryAxis,
  ChartFrame,
  ChartLegend,
  ChartTooltip,
  ValueAxis,
  spacedTicks,
  categoryLabels,
  formatSeriesValue,
  resolveMargin,
  seriesMeta,
  useChartHover,
  useChartSurfaceSize,
  useHiddenSeries,
} from "./chart-ui";

function HookProbe({
  ids,
  children,
}: {
  ids: string[];
  children: (api: ReturnType<typeof useHiddenSeries>) => ReactNode;
}) {
  return <>{children(useHiddenSeries(ids))}</>;
}

function HoverProbe({
  children,
}: {
  children: (api: ReturnType<typeof useChartHover>) => ReactNode;
}) {
  return <>{children(useChartHover())}</>;
}

function SizeProbe({ fillHeight }: { fillHeight: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useChartSurfaceSize(ref, 320, 280, fillHeight);
  return (
    <div ref={ref}>
      <span>{`${size.width}x${size.height}`}</span>
    </div>
  );
}

describe("resolveMargin", () => {
  it("fills missing sides from the default chart margin", () => {
    expect(resolveMargin({ left: 80 })).toEqual({
      top: 16,
      right: 16,
      bottom: 36,
      left: 80,
    });
  });

  it("returns defaults when margin is omitted", () => {
    expect(resolveMargin()).toEqual({
      top: 16,
      right: 16,
      bottom: 36,
      left: 44,
    });
  });
});

describe("seriesMeta and formatSeriesValue", () => {
  it("assigns ids, labels, and theme colors", () => {
    const meta = seriesMeta([{ label: "Views" }, { id: "cost", color: "red" }]);
    expect(meta[0]).toEqual({ id: "Views", label: "Views", color: "var(--chart-1)" });
    expect(meta[1]).toEqual({ id: "cost", label: "cost", color: "red" });
  });

  it("formats numbers, ranges, and missing values", () => {
    expect(formatSeriesValue(12)).toBe("12");
    expect(formatSeriesValue([2, 8], (n) => `${n}k`)).toBe("2k – 8k");
    expect(formatSeriesValue(undefined)).toBe("—");
  });
});

describe("categoryLabels", () => {
  it("uses axis data when present", () => {
    expect(categoryLabels({ data: ["Jan", "Feb"] }, 9)).toEqual(["Jan", "Feb"]);
  });

  it("falls back to 1-based indexes", () => {
    expect(categoryLabels(undefined, 3)).toEqual([1, 2, 3]);
  });
});

describe("ChartLegend", () => {
  it("toggles a series and marks it hidden", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <ChartLegend
        items={[{ id: "views", label: "Views", color: "red" }]}
        hiddenIds={new Set(["views"])}
        onToggle={onToggle}
      />,
    );
    const button = screen.getByRole("button", { name: "Views" });
    expect(button).toHaveAttribute("data-hidden", "true");
    await user.click(button);
    expect(onToggle).toHaveBeenCalledWith("views");
  });

  it("marks the legend position for layout", () => {
    render(
      <ChartLegend items={[{ id: "views", label: "Views", color: "red" }]} position="bottom" />,
    );
    expect(screen.getByRole("button", { name: "Views" }).parentElement).toHaveAttribute(
      "data-position",
      "bottom",
    );
  });
});

describe("ChartTooltip", () => {
  it("renders series rows and skips a title that duplicates the only label", () => {
    render(
      <ChartTooltip
        boundsWidth={320}
        hover={{
          x: 40,
          y: 12,
          title: "Views",
          items: [{ color: "red", label: "Views", value: "12" }],
        }}
      />,
    );
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toMatch(/Views/);
    expect(tooltip.textContent).toMatch(/12/);
    expect(tooltip.querySelector(".spk-chart-tooltip-title")).toBeNull();
  });

  it("renders nothing when hover is empty or a custom renderer returns null", () => {
    const { rerender } = render(<ChartTooltip hover={null} boundsWidth={200} />);
    expect(screen.queryByRole("tooltip")).toBeNull();
    rerender(
      <ChartTooltip
        boundsWidth={200}
        hover={{ x: 10, y: 10, items: [{ color: "red", label: "A", value: "1" }] }}
        render={() => null}
      />,
    );
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

describe("ChartFrame", () => {
  it("exposes the plot as an image and draws a legend", () => {
    render(
      <ChartFrame slot="sparkline" aria-label="Spark" legend={[{ id: "a", label: "Alpha", color: "navy" }]}>
        {({ width, height }) => <svg data-testid="plot" width={width} height={height} />}
      </ChartFrame>,
    );
    expect(screen.getByRole("group", { name: "Spark" })).toHaveAttribute("data-slot", "sparkline");
    expect(screen.getByRole("button", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByTestId("plot")).toBeInTheDocument();
  });

  it("covers the plot with loading or empty status", () => {
    const { rerender } = render(
      <ChartFrame slot="status-chart" aria-label="Status" loading>
        {() => <svg data-testid="plot" />}
      </ChartFrame>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    expect(screen.getByRole("group", { name: "Status" })).toHaveAttribute("aria-busy", "true");
    rerender(
      <ChartFrame slot="status-chart" aria-label="Status" empty emptyText="Nothing yet">
        {() => <svg data-testid="plot" />}
      </ChartFrame>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Nothing yet");
  });

  it("places the legend after the plot when position is bottom", () => {
    const { container } = render(
      <ChartFrame
        slot="legend-chart"
        aria-label="Legend"
        legendPosition="bottom"
        legend={[{ id: "a", label: "Alpha", color: "navy" }]}
      >
        {() => <svg data-testid="plot" />}
      </ChartFrame>,
    );
    const body = container.querySelector(".spk-chart-body");
    expect(body?.className).toMatch(/spk-chart--legend-bottom/);
    expect(body?.lastElementChild?.className).toMatch(/spk-chart-legend/);
  });

  it("does not paint children when fillHeight has no measured height yet", () => {
    render(
      <ChartFrame slot="fill-chart" fillHeight height={280}>
        {() => <svg data-testid="plot" />}
      </ChartFrame>,
    );
    expect(screen.queryByTestId("plot")).toBeNull();
  });
});

describe("axes and grid", () => {
  it("draws grid lines and formatted ticks", () => {
    const { container } = render(
      <svg>
        <CartesianGrid ticks={[0, 10]} scale={(v) => 100 - v} left={20} right={200} top={10} bottom={90} />
        <ValueAxis ticks={[0, 10]} scale={(v) => 100 - v * 5} left={20} format={(v) => `${v}%`} />
        <CategoryAxis labels={["Jan", "Feb"]} position={(i) => 40 + i * 80} y={90} tickAngle={-45} />
      </svg>,
    );
    expect(container.querySelector('[data-slot="chart-grid"]')).toBeTruthy();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toHaveAttribute("transform", "rotate(-45 40 106)");
  });
});

describe("spacedTicks", () => {
  it("drops labels that would overlap on a short plot", () => {
    const scale = (v: number) => 60 - v * 0.5; // 10 units = 5px
    expect(spacedTicks([0, 10, 20, 30, 40, 50, 60], scale)).toEqual([0, 30, 60]);
    render(
      <svg>
        <ValueAxis ticks={[0, 10, 20, 30]} scale={scale} left={20} />
      </svg>,
    );
    expect(document.querySelectorAll('[data-slot="chart-y-axis"] text')).toHaveLength(2);
  });
});

describe("useHiddenSeries", () => {
  it("hides a series on toggle and restores it on the next click", async () => {
    const user = userEvent.setup();
    render(
      <HookProbe ids={["a", "b"]}>
        {({ hidden, toggle, visible }) => (
          <div>
            <p>{visible.join(",")}</p>
            <button type="button" onClick={() => toggle("b")}>
              Toggle B
            </button>
            <span data-hidden={hidden.has("b") ? "true" : "false"} />
          </div>
        )}
      </HookProbe>,
    );
    expect(screen.getByText("a,b")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Toggle B" }));
    expect(screen.getByText("a")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Toggle B" }));
    expect(screen.getByText("a,b")).toBeInTheDocument();
  });
});

describe("useChartHover", () => {
  it("sets hover and clears it", async () => {
    const user = userEvent.setup();
    render(
      <HoverProbe>
        {({ hover, setHover, clear }) => (
          <div>
            <p>{hover ? hover.title : "none"}</p>
            <button
              type="button"
              onClick={() =>
                setHover({ x: 1, y: 1, title: "Feb", items: [{ color: "red", label: "A", value: "2" }] })
              }
            >
              Hover
            </button>
            <button type="button" onClick={clear}>
              Clear
            </button>
          </div>
        )}
      </HoverProbe>,
    );
    expect(screen.getByText("none")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hover" }));
    expect(screen.getByText("Feb")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("none")).toBeInTheDocument();
  });
});

describe("useChartSurfaceSize", () => {
  it("starts at the numeric fallback when fillHeight is off", () => {
    render(<SizeProbe fillHeight={false} />);
    expect(screen.getByText("320x280")).toBeInTheDocument();
  });

  it("starts at height 0 when fillHeight is on so a 280px fallback is not painted", () => {
    render(<SizeProbe fillHeight />);
    expect(screen.getByText("320x0")).toBeInTheDocument();
  });
});
