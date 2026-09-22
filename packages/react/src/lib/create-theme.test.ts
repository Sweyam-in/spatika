import { afterEach, describe, expect, it } from "vitest";
import {
  createTheme,
  injectCustomThemeStyles,
  PALETTE_CSS_VARS,
  themeToCss,
} from "./create-theme";

describe("createTheme", () => {
  afterEach(() => {
    document.getElementById("spk-custom-themes")?.remove();
  });

  it("overlays palette, glass, and shape onto a built-in theme", () => {
    const theme = createTheme({
      id: "brand",
      label: "Brand",
      extends: "neelam",
      palette: { primary: "#22c55e", primaryForeground: "#052e16", chart1: "#4ade80" },
      glass: { blur: "12px" },
      shape: { radius: "0.75rem" },
      typography: { fontFamily: '"Source Sans 3", sans-serif' },
      vars: { "--shadow-soft": "none" },
    });

    expect(theme.id).toBe("brand");
    expect(theme.label).toBe("Brand");
    expect(theme.extends).toBe("neelam");
    expect(theme.colorScheme).toBe("dark");
    expect(theme.vars["--primary"]).toBe("#22c55e");
    expect(theme.vars["--primary-foreground"]).toBe("#052e16");
    expect(theme.vars["--chart-1"]).toBe("#4ade80");
    expect(theme.vars["--glass-blur"]).toBe("12px");
    expect(theme.vars["--radius"]).toBe("0.75rem");
    expect(theme.vars["--font-sans"]).toBe('"Source Sans 3", sans-serif');
    expect(theme.vars["--shadow-soft"]).toBe("none");
  });

  it("defaults to a light Mukta base", () => {
    const theme = createTheme({ id: "lilac", palette: { primary: "#7c3aed" } });
    expect(theme.extends).toBe("mukta");
    expect(theme.colorScheme).toBe("light");
    expect(theme.label).toBe("lilac");
  });

  it("rejects empty and built-in ids", () => {
    expect(() => createTheme({ id: "   " })).toThrow(/required/);
    expect(() => createTheme({ id: "neelam" })).toThrow(/built-in/);
  });

  it("serializes an attribute selector stylesheet", () => {
    const theme = createTheme({
      id: "brand",
      palette: { primary: "#7c3aed" },
      typography: { fontFamily: "Georgia, serif" },
    });
    const css = themeToCss(theme);
    expect(css).toContain('[data-spk-theme="brand"]');
    expect(css).toContain("--primary: #7c3aed;");
    expect(css).toContain("font-family: var(--font-sans);");
  });

  it("injects and replaces a document stylesheet", () => {
    const brand = createTheme({ id: "brand", palette: { primary: "#7c3aed" } });
    injectCustomThemeStyles([brand]);
    const el = document.getElementById("spk-custom-themes");
    expect(el?.tagName).toBe("STYLE");
    expect(el?.textContent).toContain("--primary: #7c3aed;");

    injectCustomThemeStyles([]);
    expect(document.getElementById("spk-custom-themes")).toBeNull();
  });

  it("maps every palette key to a CSS variable", () => {
    expect(PALETTE_CSS_VARS.primary).toBe("--primary");
    expect(PALETTE_CSS_VARS.mutedForeground).toBe("--muted-foreground");
    expect(Object.keys(PALETTE_CSS_VARS).length).toBeGreaterThan(20);
  });
});
