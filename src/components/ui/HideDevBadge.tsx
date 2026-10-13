"use client";

import { useEffect } from "react";

/**
 * Development only (see layout.tsx). On localhost Next.js draws a round "N" badge in the bottom-left corner of the page,
 * and turns it into a red "1 Issue" pill whenever something logs an error. next.config.ts switches the badge off, but
 * Next brings it back as soon as there is an issue, so this keeps that corner clear as well.
 *
 * It hides only the badge. A build error (a broken import, say) still takes over the page as a full-screen error, so
 * something that really breaks is never invisible. The badge lives inside a shadow root that the page's own CSS cannot
 * reach, so the rule is added inside it.
 */
export function HideDevBadge() {
  useEffect(() => {
    const hide = (portal: Element) => {
      const root = portal.shadowRoot;
      if (!root || root.getElementById("hide-dev-badge")) return;
      const style = document.createElement("style");
      style.id = "hide-dev-badge";
      style.textContent = "[data-next-badge-root] { display: none !important; }";
      root.appendChild(style);
    };
    const hideAll = () => document.querySelectorAll("nextjs-portal").forEach(hide);

    hideAll();
    // The portal can be created after the page has loaded, so keep an eye out for it
    const watcher = new MutationObserver(hideAll);
    watcher.observe(document.body, { childList: true });
    return () => watcher.disconnect();
  }, []);

  return null;
}
