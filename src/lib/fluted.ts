// Shared by the Projects gallery, the Process section and the Testimonials, so all use the identical reveal.

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * The fluted reveal. The layer is clipped to a row of vertical slats (one clip-path with n rectangles), each
 * rising from the bottom edge (or dropping from the top edge). Slats nearest the centre start first, so the
 * leading edge forms a soft arch.
 *
 * @param p        reveal progress, 0 to 1
 * @param n        number of slats
 * @param W,H      size of the clipped element in px
 * @param spread   how far the centre slats lead the outer slats (0 = all together)
 * @param gap      px between slats while they are moving; closes to 0 as each lands
 * @param fromTop  slats drop from the top edge instead of rising from the bottom
 */
export function slats(
  p: number,
  n: number,
  W: number,
  H: number,
  spread = 0.55,
  gap = 3,
  fromTop = false,
): string {
  const sw = W / n;
  let d = "";
  for (let i = 0; i < n; i++) {
    const dist = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2); // 0 at the centre, 1 at the outer slats
    const e = easeInOut(clamp01((p - dist * spread) / (1 - spread)));
    if (e <= 0) continue;
    const h = H * e;
    const g = gap * (1 - e);
    const x = i * sw + g / 2;
    const w = sw - g + 0.5; // +0.5 so neighbouring slats overlap and no seam shows when they meet
    const y = fromTop ? 0 : H - h;
    d += `M${x.toFixed(2)} ${y.toFixed(2)}h${w.toFixed(2)}v${h.toFixed(2)}h${(-w).toFixed(2)}z`;
  }
  return d ? `path("${d}")` : fromTop ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)";
}
