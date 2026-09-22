import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@spatika/tokens/styles.css";
import "@spatika/tokens/fonts.css";
import "@spatika/editor/styles.css";
import { SPATIKA_THEME_STORAGE_KEY, SpatikaThemeProvider } from "@spatika/react";
import { Analytics } from "@/components/Analytics";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Seo } from "@/components/Seo";
import { SITE } from "@/data/site";
import App from "./App";
import "./styles.css";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpatikaThemeProvider defaultTheme={SITE.defaultTheme} storageKey={SPATIKA_THEME_STORAGE_KEY}>
      <BrowserRouter basename={basename || undefined}>
        <Seo />
        <Analytics />
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </SpatikaThemeProvider>
  </StrictMode>,
);
