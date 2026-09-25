---
"@spatika/charts": patch
"@spatika/react": patch
---

Charts drop y-axis tick labels that would overlap on a short plot (a dashboard tile or card) instead of stacking them. SiteFooter's link columns fit the space they are given (auto-fit grid) rather than switching to three columns by viewport width, so they no longer overlap in a narrow container.
