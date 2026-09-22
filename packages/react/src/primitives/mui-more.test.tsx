import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Autocomplete } from "./Autocomplete";
import { Box, Grid } from "./Grid";
import { FormControl, FormHelperText, FormLabel } from "./FormControl";
import { Input } from "./Input";
import { Rating } from "./StarRating";
import { TransferList } from "./TransferList";
import { BottomNavigation, BottomNavigationAction } from "./BottomNavigation";
import { Fade } from "./transitions";
import { NoSsr } from "./NoSsr";
import { Button } from "./Button";

describe("Autocomplete", () => {
  it("filters and selects an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Autocomplete
        label="Movie"
        options={["Inception", "Heat", "Her"]}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "He");
    await user.click(screen.getByRole("option", { name: "Heat" }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("Heat");
  });
});

describe("layout and form extras", () => {
  it("renders Grid, Box, FormControl, Rating, Fade, and TransferList", async () => {
    const user = userEvent.setup();
    const onTransfer = vi.fn();
    render(
      <Box>
        <Grid container spacing={2}>
          <Grid xs={6}>Left</Grid>
          <Grid xs={6}>Right</Grid>
        </Grid>
        <FormControl error>
          <FormLabel>Email</FormLabel>
          <Input />
          <FormHelperText>Required</FormHelperText>
        </FormControl>
        <Rating defaultValue={3} />
        <Fade in>Shown</Fade>
        <NoSsr>
          <span>Client</span>
        </NoSsr>
        <TransferList left={["Java"]} right={["React"]} onChange={onTransfer} />
      </Box>,
    );
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Shown")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Java/ }));
    await user.click(screen.getByRole("button", { name: "Move right" }));
    expect(onTransfer).toHaveBeenCalled();
  });

  it("applies Grid breakpoint span classes including xl", () => {
    const { container } = render(
      <Grid container>
        <Grid xs={12} sm={6} md={4} lg={3} xl={2}>
          Cell
        </Grid>
      </Grid>,
    );
    const item = container.querySelector("[data-slot='grid'][data-item]");
    expect(item?.className).toContain("col-span-12");
    expect(item?.className).toContain("sm:col-span-6");
    expect(item?.className).toContain("md:col-span-4");
    expect(item?.className).toContain("lg:col-span-3");
    expect(item?.className).toContain("xl:col-span-2");
    expect(screen.getByText("Cell")).toBeInTheDocument();
  });

  it("switches BottomNavigation actions", async () => {
    const user = userEvent.setup();
    render(
      <BottomNavigation defaultValue="home">
        <BottomNavigationAction value="home" label="Home" />
        <BottomNavigationAction value="me" label="You" />
      </BottomNavigation>,
    );
    await user.click(screen.getByRole("button", { name: "You" }));
    expect(screen.getByRole("button", { name: "You" })).toHaveAttribute("aria-current", "page");
  });
});
