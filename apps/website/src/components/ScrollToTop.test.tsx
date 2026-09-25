import { useEffect, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollToTop } from "./ScrollToTop";

/** Renders its anchor a tick after mounting, like a code-split page arriving. */
function LatePage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 20);
    return () => clearTimeout(timer);
  }, []);
  return ready ? <h2 id="late">Late section</h2> : <p>Loading</p>;
}

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
              <Link to="/late#late">Go to late section</Link>
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
        <Route path="/late" element={<LatePage />} />
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

  it("scrolls to an anchor that renders after the page changes", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    renderApp("/first");

    await user.click(screen.getByRole("link", { name: "Go to late section" }));
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: "Late section" })).toBeInTheDocument();
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
