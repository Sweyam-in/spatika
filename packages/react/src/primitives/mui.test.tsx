import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AccordionActions,
  AccordionContent,
  AccordionItem,
  AccordionSummary,
} from "./Accordion";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { CircularProgress } from "./CircularProgress";
import { Collapse } from "./Collapse";
import { Fab } from "./Fab";
import { FormControlLabel } from "./FormControlLabel";
import { IconButton } from "./IconButton";
import { Link } from "./Link";
import { List, ListItem, ListItemText } from "./List";
import { Paper } from "./Paper";
import { Stack } from "./Stack";
import { Step, StepLabel, Stepper } from "./Stepper";
import { TextField } from "./TextField";
import { ToggleButton, ToggleButtonGroup } from "./ToggleButton";
import { Typography } from "./Typography";
import { Checkbox } from "./Checkbox";

describe("Accordion", () => {
  it("expands and collapses a panel", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" defaultValue="a">
        <AccordionItem value="a">
          <AccordionSummary>Panel A</AccordionSummary>
          <AccordionContent>Body A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionSummary>Panel B</AccordionSummary>
          <AccordionContent>Body B</AccordionContent>
          <AccordionActions>
            <Button>Save</Button>
          </AccordionActions>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText("Body A")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Panel B" }));
    expect(screen.getByText("Body B")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Panel A" })).toHaveAttribute("aria-expanded", "false");
  });

  it("does not toggle a disabled item", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem value="a" disabled>
          <AccordionSummary>Locked</AccordionSummary>
          <AccordionContent>Secret</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole("button", { name: "Locked" }));
    expect(screen.getByRole("button", { name: "Locked" })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MUI-style primitives", () => {
  it("renders ButtonGroup, Fab, IconButton, and Link", () => {
    render(
      <div>
        <ButtonGroup>
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
        <Fab aria-label="Add">+</Fab>
        <IconButton aria-label="More">…</IconButton>
        <Link href="#docs">Docs</Link>
      </div>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "#docs");
  });

  it("toggles exclusive ToggleButtonGroup values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleButtonGroup exclusive defaultValue="left" onValueChange={onChange}>
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleButtonGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Right" }));
    expect(onChange).toHaveBeenCalledWith("right");
  });

  it("renders Stepper, List, Paper, Stack, Typography, and TextField", () => {
    render(
      <Stack spacing={2}>
        <Typography variant="h5">Title</Typography>
        <Paper>Surface</Paper>
        <Stepper activeStep={1}>
          <Step>
            <StepLabel>Account</StepLabel>
          </Step>
          <Step>
            <StepLabel>Details</StepLabel>
          </Step>
        </Stepper>
        <List>
          <ListItem>
            <ListItemText primary="Alex" secondary="Designer" />
          </ListItem>
        </List>
        <TextField label="Email" helperText="Work address" />
        <FormControlLabel control={<Checkbox />} label="Subscribe" />
        <CircularProgress value={40} variant="determinate" />
        <Collapse in>Shown</Collapse>
      </Stack>,
    );
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Surface")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("Shown")).toBeInTheDocument();
  });
});
