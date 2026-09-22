import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SlashCommandItem } from "../lib/types";
import { SlashCommandMenu } from "./SlashCommandMenu";

const items: SlashCommandItem[] = [
  {
    id: "h1",
    title: "Heading 1",
    description: "Large title",
    command: vi.fn(),
  },
];

describe("SlashCommandMenu", () => {
  it("renders filtered slash commands", async () => {
    const onSelect = vi.fn();
    render(
      <SlashCommandMenu
        editor={null}
        items={items}
        query="head"
        activeIndex={0}
        open
        onSelect={onSelect}
      />,
    );
    expect(screen.getByRole("listbox", { name: "Slash commands" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: /Heading 1/i }));
    expect(onSelect).toHaveBeenCalledWith(items[0]);
  });
});
