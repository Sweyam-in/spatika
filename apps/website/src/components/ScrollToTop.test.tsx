import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollToTop } from "./ScrollToTop";

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ScrollToTop />
      <Routes>
        <Route
          path="/first"
          element={
            <div>
              <p>First page</p>
              <Link to="/second">Go to second</Link>
              <Link to="/second#section">Go to second section</Link>
              <Link to="/first#local">On-page section</Link>
            </div>
          }
        />
        <Route
          path="/second"
          element={
            <div>
              <p>Second page</p>
              <h2 id="section">Section</h2>
            </div>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ScrollToTop", () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    vi.restoreAllMocks();
  });

  it("scrolls to the top when the pathname changes", async () => {
    const user = userEvent.setup();
    renderApp("/first");
    vi.mocked(window.scrollTo).mockClear();

    await user.click(screen.getByRole("link", { name: "Go to second" }));
    expect(screen.getByText("Second page")).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("scrolls the hash target into view on a new page", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    renderApp("/first");
    vi.mocked(window.scrollTo).mockClear();

    await user.click(screen.getByRole("link", { name: "Go to second section" }));
    expect(screen.getByRole("heading", { name: "Section" })).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("does not reset to the top for same-page hash links", async () => {
    const user = userEvent.setup();
    renderApp("/first");
    vi.mocked(window.scrollTo).mockClear();

    await user.click(screen.getByRole("link", { name: "On-page section" }));
    expect(screen.getByText("First page")).toBeInTheDocument();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
