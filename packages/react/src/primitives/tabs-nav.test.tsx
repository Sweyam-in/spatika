import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppShell, NavItem, NavSection, Sidebar } from "../composites/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

describe("Tabs", () => {
  it("only references panels that are rendered", () => {
    render(
      <Tabs defaultValue="all">
        <TabsList aria-label="Filter">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    for (const tab of screen.getAllByRole("tab")) expect(tab).not.toHaveAttribute("aria-controls");
  });

  it("links the selected tab to its panel", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Sections">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    const tab = screen.getByRole("tab", { name: "A" });
    expect(tab).toHaveAttribute("aria-controls", screen.getByRole("tabpanel").id);
    expect(screen.getByRole("tab", { name: "B" })).not.toHaveAttribute("aria-controls");
  });

  it("keeps the tab list reachable when no tab is selected", async () => {
    const user = userEvent.setup();
    render(
      <Tabs>
        <TabsList aria-label="Views">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    await user.tab();
    expect(screen.getByRole("tab", { name: "List" })).toHaveFocus();
  });
});

describe("NavItem", () => {
  it("is a list item inside a NavSection and a plain control elsewhere", () => {
    render(
      <AppShell sidebar={<Sidebar footer={<NavItem label="Settings" />}><NavSection title="Main"><NavItem label="Home" active /></NavSection></Sidebar>}>
        content
      </AppShell>,
    );
    const home = screen.getAllByRole("button", { name: "Home" })[0];
    expect(home.closest("li")?.parentElement?.tagName).toBe("UL");
    const settings = screen.getAllByRole("button", { name: "Settings" })[0];
    expect(settings.closest("li")).toBeNull();
  });
});
