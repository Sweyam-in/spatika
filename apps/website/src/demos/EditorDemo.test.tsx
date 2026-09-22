import { render, screen } from "@testing-library/react";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { editorDemo } from "./EditorDemo";

describe("EditorDemo", () => {
  it("renders spatika editor playground link in full preview", () => {
    render(
      <SpatikaThemeProvider defaultTheme="mukta">{editorDemo(false)["spatika-editor"]}</SpatikaThemeProvider>,
    );
    expect(screen.getByRole("link", { name: "full editor playground" })).toHaveAttribute(
      "href",
      "/demos/editor",
    );
  });

  it("renders compact spatika editor preview", async () => {
    render(
      <SpatikaThemeProvider defaultTheme="mukta">{editorDemo(true)["spatika-editor"]}</SpatikaThemeProvider>,
    );
    expect(await screen.findByRole("toolbar", { name: "Editor formatting" })).toBeInTheDocument();
  });

  it("renders headless and legacy editor previews", async () => {
    render(
      <SpatikaThemeProvider defaultTheme="mukta">
        {editorDemo(false)["use-spatika-editor"]}
        {editorDemo(false)["rich-text-editor"]}
      </SpatikaThemeProvider>,
    );
    expect(await screen.findAllByRole("textbox", { name: "Rich text editor" })).toHaveLength(2);
    expect(screen.getAllByRole("toolbar", { name: "Editor formatting" }).length).toBeGreaterThan(0);
  });
});
