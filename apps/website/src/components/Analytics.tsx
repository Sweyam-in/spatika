import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = "G-D38N6ZVFM0";

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    window.gtag?.("config", GA_ID, {
      page_path: `${location.pathname}${location.search}${location.hash}`,
    });
  }, [location]);

  return null;
}