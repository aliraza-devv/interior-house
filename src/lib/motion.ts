// The visitor's choice to pause the page's own looping motion (the hero film and the footer drawing). It is set from the
// menu, remembered between visits, and announced with a "motion:change" event so each piece can follow. Motion the visitor
// drives themselves (scrolling) is not affected, and a device set to reduced motion never starts the loops at all.
const KEY = "hw-motion";

const stored = (): boolean => {
  try {
    return localStorage.getItem(KEY) === "paused";
  } catch {
    return false;
  }
};

/** True when the visitor has paused the page's looping motion. */
export function motionPaused(): boolean {
  const root = document.documentElement;
  if (!root.dataset.motion) root.dataset.motion = stored() ? "paused" : "play";
  return root.dataset.motion === "paused";
}

export function setMotionPaused(paused: boolean) {
  document.documentElement.dataset.motion = paused ? "paused" : "play";
  try {
    localStorage.setItem(KEY, paused ? "paused" : "play");
  } catch {
    // private mode: the choice simply lasts for this visit
  }
  window.dispatchEvent(new Event("motion:change"));
}
