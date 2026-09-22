import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MentionMenu } from "./MentionMenu";

const contacts = [{ id: "1", label: "Asha Verma", subtitle: "Design" }];

describe("MentionMenu", () => {
  it("returns null when closed", () => {
    const { container } = render(
      <MentionMenu contacts={contacts} query="" activeIndex={0} open={false} onSelect={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("selects a contact on option click", async () => {
    const onSelect = vi.fn();
    render(
      <MentionMenu contacts={contacts} query="ash" activeIndex={0} open onSelect={onSelect} />,
    );
    expect(screen.getByRole("listbox", { name: "Mentions" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: /Asha Verma/i }));
    expect(onSelect).toHaveBeenCalledWith(contacts[0]);
  });
});
