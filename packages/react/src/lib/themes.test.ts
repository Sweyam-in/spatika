import { afterEach, describe, expect, it } from "vitest";
import {
  applyTheme,
  DEFAULT_THEME,
  isDarkTheme,
  isThemeId,
  SPATIKA_THEME_STORAGE_KEY,
  readStoredTheme,
  THEME_IDS,
  THEME_LABELS,
  writeStoredTheme,
} from "./themes";

function resetRoot() {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-spk-theme");
  document.documentElement.style.colorScheme = "";
}

describe("themes", () => {
  afterEach(() => {
    resetRoot();
    localStorage.removeItem(SPATIKA_THEME_STORAGE_KEY);
  });

  it("lists four named theme ids", () => {
    expect(THEME_IDS).toEqual(["mukta", "neelam", "usha", "sandhya"]);
    expect(DEFAULT_THEME).toBe("mukta");
  });

  it("provides human labels for each theme", () => {
    for (const id of THEME_IDS) {
      expect(THEME_LABELS[id]).toBeTruthy();
    }
  });

  it("narrows theme ids", () => {
    expect(isThemeId("neelam")).toBe(true);
    expect(isThemeId("dark")).toBe(false);
    expect(isDarkTheme("neelam")).toBe(true);
    expect(isDarkTheme("usha")).toBe(false);
  });

  it("applies neelam theme class and data attribute", () => {
    applyTheme("neelam");
    expect(document.documentElement.classList.contains("neelam")).toBe(true);
    expect(document.documentElement.getAttribute("data-spk-theme")).toBe("neelam");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("clears theme classes for mukta", () => {
    applyTheme("neelam");
    applyTheme("mukta");
    expect(document.documentElement.classList.contains("neelam")).toBe(false);
    expect(document.documentElement.getAttribute("data-spk-theme")).toBe("mukta");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("applies usha and sandhya without leaving stale classes", () => {
    applyTheme("usha");
    applyTheme("sandhya");
    expect(document.documentElement.classList.contains("usha")).toBe(false);
    expect(document.documentElement.classList.contains("sandhya")).toBe(true);
  });

  it("applies a custom theme id on top of its base", () => {
    applyTheme("brand", undefined, {
      id: "brand",
      extends: "neelam",
      colorScheme: "dark",
    });
    expect(document.documentElement.classList.contains("neelam")).toBe(true);
    expect(document.documentElement.getAttribute("data-spk-theme")).toBe("brand");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("reads and writes stored themes", () => {
    expect(readStoredTheme(SPATIKA_THEME_STORAGE_KEY)).toBeNull();
    writeStoredTheme(SPATIKA_THEME_STORAGE_KEY, "sandhya");
    expect(readStoredTheme(SPATIKA_THEME_STORAGE_KEY)).toBe("sandhya");
    writeStoredTheme(false, "neelam");
    expect(readStoredTheme(SPATIKA_THEME_STORAGE_KEY)).toBe("sandhya");
  });

  it("restores a custom stored theme when it is allowed", () => {
    writeStoredTheme(SPATIKA_THEME_STORAGE_KEY, "brand");
    expect(readStoredTheme(SPATIKA_THEME_STORAGE_KEY)).toBeNull();
    expect(readStoredTheme(SPATIKA_THEME_STORAGE_KEY, ["brand"])).toBe("brand");
  });
});
