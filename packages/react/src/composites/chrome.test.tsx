import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, afterEach, vi } from "vitest";
import {
  FloatingPageChromeBar,
  FloatingPageChromeIdentity,
  FloatingPageChromeSearchField,
} from "./FloatingPageChrome";
import { FilterSheet } from "./FilterSheet";
import { CoverHero } from "./CoverHero";
import { CoverPattern } from "./CoverPattern";
import { PageStickyHeader } from "./PageStickyHeader";
import { MobileTabBar } from "./MobileTabBar";
import { ProfileHero } from "./ProfileHero";
import { Home } from "lucide-react";
import { getCoverPattern } from "../lib/cover-pattern";
import { useCoverChromeBleed } from "../lib/use-cover-chrome-bleed";

describe("FloatingPageChrome", () => {
  it("renders identity title, count, and search", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const onChange = vi.fn();
    render(
      <FloatingPageChromeBar
        identity={
          <FloatingPageChromeIdentity title="People" count={12} onBack={onBack} />
        }
        search={
          <FloatingPageChromeSearchField
            value="al"
            onChange={onChange}
            onClear={() => onChange("")}
            placeholder="Search people…"
          />
        }
      />,
    );
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Go back"));
    expect(onBack).toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Search people…")).toHaveValue("al");
    expect(document.querySelector(".glass-page-toolbar")).toBeTruthy();
  });

  it("pins children in a nested scroller", () => {
    render(
      <FloatingPageChromeBar
        identity={<FloatingPageChromeIdentity title="People" count={4} />}
      >
        <p>Directory body</p>
      </FloatingPageChromeBar>,
    );
    expect(document.querySelector(".app-page-chrome")).toBeTruthy();
    expect(document.querySelector(".app-page-chrome-body")).toHaveTextContent("Directory body");
  });
});

describe("PageStickyHeader", () => {
  it("renders title, count, and density slots", () => {
    render(
      <PageStickyHeader
        offsetClassName="top-0"
        title="Insights"
        subtitle="Last 30 days"
        count={8}
      />,
    );
    expect(screen.getByText("Insights")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});

describe("FilterSheet", () => {
  it("opens a desktop popover from the chrome trigger", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <FilterSheet
        open={false}
        onOpenChange={onOpenChange}
        title="View & filters"
        trigger={<button type="button">Filters</button>}
      >
        <p>Status</p>
      </FilterSheet>,
    );
    await user.click(screen.getByText("Filters"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("CoverPattern", () => {
  it("seeds a stable scene kind", () => {
    const a = getCoverPattern({ seed: "alex", hue: 210 });
    const b = getCoverPattern({ seed: "alex", hue: 210 });
    expect(a.kind).toBe(b.kind);
    expect(a.headerInk).toMatch(/light|dark/);
    expect(a.chromeInk).toMatch(/light|dark/);
  });

  it("renders a cover pattern node", () => {
    const { container } = render(<CoverPattern seed="alex" hue={210} />);
    expect(container.querySelector("[data-cover-pattern]")).toBeTruthy();
  });
});

describe("CoverHero", () => {
  it("renders title, kicker, and facts", () => {
    render(
      <CoverHero
        title="Friday night · Studio district"
        kicker={<span>Meetup Story</span>}
        facts={[{ key: "when", label: "When", value: "Fri 14 Mar" }]}
        avatars={[{ name: "Alex Rivera" }]}
      />,
    );
    expect(screen.getByText("Friday night · Studio district")).toBeInTheDocument();
    expect(screen.getByText("Meetup Story")).toBeInTheDocument();
    expect(screen.getByText("When")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='cover-hero']")).toHaveAttribute(
      "data-cover-bleed",
      "true",
    );
  });

  it("keeps the cover inside the frame when bleed is off", () => {
    render(
      <CoverHero title="Coastal Drive" coverSeed="coast" bleed={false} />,
    );
    const hero = document.querySelector("[data-slot='cover-hero']");
    expect(hero).not.toHaveAttribute("data-cover-bleed");
    expect(hero).toHaveClass("overflow-hidden");
    expect(document.querySelector(".cover-chrome-bar")).toBeNull();
  });
});

describe("ProfileHero", () => {
  it("renders name, alias, and a notched identity plate", () => {
    const { container } = render(
      <ProfileHero name="Alex Chen" alias="Product designer" coverSeed="alex" />,
    );
    expect(screen.getByText("Alex Chen")).toBeInTheDocument();
    expect(screen.getByText("Product designer")).toBeInTheDocument();
    expect(container.querySelector(".profile-identity")).toBeTruthy();
    expect(container.querySelector(".profile-identity__plate")).toBeTruthy();
    expect(container.querySelector("[data-slot='profile-hero']")).toHaveAttribute(
      "data-cover-bleed",
      "true",
    );
  });

  it("contains the cover when bleed is off", () => {
    const { container } = render(
      <ProfileHero name="Alex Chen" alias="Product designer" coverSeed="alex" bleed={false} />,
    );
    const hero = container.querySelector("[data-slot='profile-hero']");
    expect(hero).not.toHaveAttribute("data-cover-bleed");
    expect(hero).toHaveClass("overflow-hidden");
    expect(hero?.querySelector(".cover-media")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Alex Chen" })).toBeDisabled();
  });
});

describe("MobileTabBar", () => {
  it("renders a floating capsule with an active item", () => {
    const { container } = render(
      <MobileTabBar
        items={[{ id: "home", label: "Home", icon: Home, active: true }]}
      />,
    );
    expect(container.querySelector("[data-app-tabbar]")).toBeTruthy();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});

function BleedProbe({ active }: { active: boolean }) {
  useCoverChromeBleed(active, "light");
  return <span>probe</span>;
}

describe("useCoverChromeBleed", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-cover-chrome-bleed");
    document.documentElement.removeAttribute("data-cover-chrome-ink");
    document.documentElement.removeAttribute("data-profile-cover-bleed");
    document.documentElement.removeAttribute("data-profile-cover-ink");
  });

  it("sets and clears cover bleed attributes", () => {
    const { unmount } = render(<BleedProbe active />);
    expect(document.documentElement.getAttribute("data-cover-chrome-bleed")).toBe("true");
    expect(document.documentElement.getAttribute("data-cover-chrome-ink")).toBe("light");
    unmount();
    expect(document.documentElement.getAttribute("data-cover-chrome-bleed")).toBeNull();
  });
});
