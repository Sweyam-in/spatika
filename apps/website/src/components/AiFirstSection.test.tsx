import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { AiFirstSection } from "./AiFirstSection";

function renderSection() {
  return render(
    <MemoryRouter>
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <AiFirstSection />
      </SpatikaThemeProvider>
    </MemoryRouter>,
  );
}

describe("AiFirstSection", () => {
  it("explains the agent catalog and links to llms.txt", () => {
    renderSection();
    expect(
      screen.getByRole("heading", { name: "An AI-first React toolkit" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/reusable Spatika skill, and an MCP server/i)).toBeInTheDocument();
    const llms = screen.getByRole("link", { name: "Open llms.txt" });
    expect(llms).toHaveAttribute("href", "/llms.txt");
    expect(llms.className).toMatch(/min-h-11|h-11/);
    expect(screen.getByRole("link", { name: "/llms.txt" })).toHaveAttribute("href", "/llms.txt");
    expect(screen.getByRole("link", { name: "/llms-full.txt" })).toHaveAttribute(
      "href",
      "/llms-full.txt",
    );
  });

  it("points agents at the setup guide, skill copy command, and MCP package", () => {
    renderSection();
    expect(screen.getByRole("link", { name: "Agent setup" })).toHaveAttribute(
      "href",
      "/guides#ai-agents",
    );
    expect(
      screen.getByText(
        "cp -R node_modules/@spatika/react/skills/spatika-ui .cursor/skills/spatika-ui",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("npx @spatika/mcp")).toBeInTheDocument();
  });
});
