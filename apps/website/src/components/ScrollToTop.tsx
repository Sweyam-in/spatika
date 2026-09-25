import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/** How long to wait for a code-split page to render the element a `#hash` points at. */
const HASH_WAIT_MS = 5000;

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef<string | null>(null);

  useLayoutEffect(() => {
    const pageChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (!pageChanged) return;

    const id = hash ? decodeURIComponent(hash.slice(1)) : "";
    if (!id) {
      window.scrollTo(0, 0);
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView();
      return;
    }

    // Pages load lazily, so the anchor may not exist yet: start at the top, then jump to the
    // anchor once the page renders it.
    window.scrollTo(0, 0);
    const observer = new MutationObserver(() => {
      const found = document.getElementById(id);
      if (!found) return;
      finish();
      found.scrollIntoView();
    });
    const timer = window.setTimeout(finish, HASH_WAIT_MS);
    function finish() {
      observer.disconnect();
      window.clearTimeout(timer);
    }
    observer.observe(document.body, { childList: true, subtree: true });
    return finish;
  }, [pathname, hash]);

  return null;
}
