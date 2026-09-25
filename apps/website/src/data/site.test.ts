import { describe, expect, it } from "vitest";
import { INSTALL, SITE, absoluteUrl } from "./site";

describe("site", () => {
  it("exposes brand, package, and install URLs", () => {
    expect(SITE.brand).toBe("Spatika UI");
    expect(SITE.url).toBe("https://spatika.sweyam.com");
    expect(SITE.npmReact).toContain("@spatika/react");
    expect(SITE.npmCharts).toContain("@spatika/charts");
    expect(SITE.npmEditor).toContain("@spatika/editor");
    expect(INSTALL.charts).toContain("@spatika/charts");
    expect(INSTALL.editor).toContain("@spatika/editor");
    expect(SITE.tagline).toBe("An AI-first React toolkit for serious product UI.");
    expect(SITE.description).toMatch(/You may also know it as Spadik UI/);
    expect(SITE.alternateNames).toContain("Spadik UI");
    expect(SITE.sweyamUrl).toBe("https://sweyam.com");
    expect(SITE.defaultTheme).toBe("mukta");
    expect(INSTALL.both).toBe("npm install @spatika/tokens @spatika/react");
  });

  it("builds absolute urls and normalizes missing slashes", () => {
    expect(absoluteUrl()).toBe("https://spatika.sweyam.com/");
    expect(absoluteUrl("/components/funnel-chart")).toBe(
      "https://spatika.sweyam.com/components/funnel-chart",
    );
    expect(absoluteUrl("guides")).toBe("https://spatika.sweyam.com/guides");
  });
});
