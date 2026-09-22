import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  SpatikaThemeProvider,
  Stack,
  Typography,
  createTheme,
} from "@spatika/react";

const PRESETS = {
  violet: createTheme({
    id: "docs-violet",
    label: "Violet",
    extends: "mukta",
    palette: {
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
      ring: "#7c3aed",
      accent: "rgba(124, 58, 237, 0.12)",
      accentForeground: "#5b21b6",
      chart1: "#7c3aed",
    },
  }),
  teal: createTheme({
    id: "docs-teal",
    label: "Teal",
    extends: "neelam",
    palette: {
      primary: "#2dd4bf",
      primaryForeground: "#042f2e",
      ring: "#2dd4bf",
      accent: "rgba(45, 212, 191, 0.16)",
      accentForeground: "#99f6e4",
      chart1: "#2dd4bf",
    },
  }),
} as const;

const CUSTOM_THEMES = [PRESETS.violet, PRESETS.teal];

type PresetId = keyof typeof PRESETS;

export function CustomThemeDemo() {
  const [preset, setPreset] = useState<PresetId>("violet");
  const theme = PRESETS[preset];

  return (
    <div className="customize-live">
      <Stack direction="row" spacing={1} className="mb-3">
        <Button
          size="sm"
          variant={preset === "violet" ? "default" : "outline"}
          onClick={() => setPreset("violet")}
        >
          Violet on Mukta
        </Button>
        <Button
          size="sm"
          variant={preset === "teal" ? "default" : "outline"}
          onClick={() => setPreset("teal")}
        >
          Teal on Neelam
        </Button>
      </Stack>
      <SpatikaThemeProvider
        theme={theme.id}
        customThemes={CUSTOM_THEMES}
        syncDocument={false}
        className="customize-live-frame"
      >
        <Card className="p-4">
          <Stack spacing={2}>
            <Typography variant="subtitle2">{theme.label} brand</Typography>
            <Typography variant="body2" color="muted">
              Primary, ring, and accent tokens overlay the built-in theme. The rest of the palette
              inherits.
            </Typography>
            <Stack direction="row" spacing={1} align="center">
              <Button size="sm">Primary action</Button>
              <Badge>On-theme</Badge>
            </Stack>
          </Stack>
        </Card>
      </SpatikaThemeProvider>
    </div>
  );
}
