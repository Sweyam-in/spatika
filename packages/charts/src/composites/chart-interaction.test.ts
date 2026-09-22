import { describe, expect, it, vi } from "vitest";
import { bindChartMark } from "./chart-interaction";

const event = {
  seriesId: "a",
  seriesLabel: "A",
  dataIndex: 1,
  category: "Feb",
  value: 4,
  color: "red",
};

describe("bindChartMark", () => {
  it("opens the tooltip on click when tooltipTrigger is click", () => {
    const setHover = vi.fn();
    const onItemClick = vi.fn();
    const bind = bindChartMark({
      event,
      hover: { title: "Feb", items: [{ color: "red", label: "A", value: "4" }] },
      onItemClick,
      setHover,
      clearHover: vi.fn(),
      tooltipTrigger: "click",
    });
    expect(bind.role).toBe("button");
    expect(bind.onMouseEnter).toBeUndefined();
    bind.onClick?.({ stopPropagation() {} });
    expect(setHover).toHaveBeenCalled();
    expect(onItemClick).toHaveBeenCalledWith(event);
  });
});
