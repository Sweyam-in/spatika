import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpatikaThemeProvider } from "@spatika/react";
import { beforeAll, describe, expect, it } from "vitest";
import App from "./App";

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <App />
      </SpatikaThemeProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  // Pages are code-split; load the routed page up front so lazy() resolves from the module cache.
  beforeAll(async () => {
    await import("./pages/CustomizePage");
  });

  it("routes /customize to the customize guide", async () => {
    renderApp("/customize");
    // Pages other than home are code-split, so the heading arrives once the chunk loads.
    expect(await screen.findByRole("heading", { level: 1, name: "Customize" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Customize", current: "page" })).toHaveAttribute(
      "href",
      "/customize",
    );
    expect(screen.getByRole("heading", { name: "Creating a theme" })).toBeInTheDocument();
  });

  it("does not render a docs page for an unknown path", () => {
    renderApp("/does-not-exist");
    expect(screen.queryByRole("heading", { level: 1, name: "Customize" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Design language" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Guides" })).not.toBeInTheDocument();
  });
});
