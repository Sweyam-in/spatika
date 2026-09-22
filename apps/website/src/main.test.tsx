import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SITE } from "@/data/site";

describe("main", () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeAll(async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const rootEl = document.createElement("div");
    rootEl.id = "root";
    document.body.appendChild(rootEl);
    await act(async () => {
      await import("./main");
    });
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    document.getElementById("root")?.remove();
    vi.restoreAllMocks();
  });

  it("mounts the docs site into #root", async () => {
    await waitFor(() => {
      expect(screen.getByRole("link", { name: SITE.brand })).toHaveAttribute("href", "/");
    });
    expect(document.getElementById("root")).toContainElement(
      screen.getByRole("heading", { level: 1, name: /Spatika UI/ }),
    );
  });

  it("defaults to the Mukta theme when nothing is stored", async () => {
    localStorage.removeItem("spk-theme");
    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-spk-theme")).toBe("mukta");
    });
    for (const cls of ["neelam", "usha", "sandhya"]) {
      expect(document.documentElement.classList.contains(cls)).toBe(false);
    }
  });

  it("resets scroll when moving to a new page", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    vi.mocked(window.scrollTo).mockClear();

    await user.click(screen.getByRole("link", { name: "Get started" }));

    expect(screen.getByRole("heading", { level: 1, name: "Guides" })).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
