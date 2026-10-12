"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { PlanDrawing } from "@/components/ui/PlanDrawing";
import { clamp01, easeInOut, ramp, slats } from "@/lib/fluted";
import { gsap } from "@/lib/gsap";
import { PHOTOS, unsplash } from "@/lib/photos";

// Placeholder photograph: the room the plan describes, shown whole. Replace with a real project shot.
const SRC = unsplash(PHOTOS.room.id, [3, 2]);
const ALT = PHOTOS.room.alt;

// Placeholder phases and durations. Each step is a complete 3:2 picture, and each is wider (so taller) than the last,
// so the three stand on one baseline as a flight of stairs. "w" is the step's width share.
const STEPS = [
  {
    word: "Draw",
    w: 24,
    sheet: "01 Plan",
    span: "Weeks 1 to 4",
    copy: "We measure every wall, then draw the plan by hand until each room works before it looks good.",
  },
  {
    word: "Design",
    w: 31,
    sheet: "02 Scheme",
    span: "Weeks 5 to 12",
    copy: "Materials, light and colour are chosen together on one board, so nothing is decided in isolation.",
  },
  {
    word: "Build",
    w: 38,
    sheet: "03 Room",
    span: "Weeks 13 to 38",
    copy: "Our own craftspeople fit every detail on site, with one lead accountable until handover.",
  },
] as const;

// Illustrative material swatches shown on the Design step
const SWATCHES = [
  { name: "Lime plaster", color: "#e4ddcf" },
  { name: "Smoked oak", color: "#5b4636" },
  { name: "Travertine", color: "#d2c3aa" },
  { name: "Moss linen", color: "#8a8870" },
] as const;

// Timeline units (one unit of scroll is 80% of a viewport height). Each step rises over REVEAL, one after another.
// The first starts at once: the plan begins to draw the moment the section pins, so the stage is never blank.
const STARTS = [0.05, 1.05, 2.05] as const;
const REVEAL = 0.85;
const TAIL = 0.45; // hold on the finished staircase
const TOTAL = STARTS[2] + REVEAL + TAIL;

/**
 * "The staircase". A process is a sequence of steps, so the section is a flight of three steps. Each step is a
 * complete picture of the same room in its own state, at a natural 3:2, wider and taller than the one before:
 *
 *   Draw    a floor plan of the room, drawn as an architect would (the lines draw themselves as the step rises)
 *   Design  the room, with a plate of material swatches
 *   Build   the finished room
 *
 * Each step is a drawing sheet (linen paper, a faint grid, a double border) that is on the page from the first
 * frame, with its sheet number, so the stage never reads as empty or unloaded. The pictures then rise into their
 * sheets one after another in the same fluted slat reveal used in Projects (the plan draws itself on its sheet
 * instead). Each phase's word and description sit in the air above its step with a fine leader line down to the
 * step's corner, and an architectural dimension string under each step gives its duration.
 *
 * On a phone there is no room for a staircase, so the three sheets stack in one frame and rise over each other.
 * One render function reads the scroll position and sets every style. Only transform, opacity and clip-path change
 * (plus the drawing's stroke offset). Without JavaScript or with reduced motion the section is a plain list.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".pro-step", section).map((el) => ({
          block: el.querySelector<HTMLElement>(".pro-block"),
          fill: el.querySelector<HTMLElement>(".pro-fill"),
          img: el.querySelector<HTMLElement>(".pro-img"),
          plan: el.querySelector<SVGElement>(".pro-plan"),
          word: el.querySelector<HTMLElement>(".pro-word"),
          desc: el.querySelector<HTMLElement>(".pro-desc"),
          leader: el.querySelector<HTMLElement>(".pro-leader"),
          span: el.querySelector<HTMLElement>(".pro-span"),
        }));
        const mdescs = gsap.utils.toArray<HTMLElement>(".pro-mdesc", section);
        if (
          steps.length !== 3 ||
          steps.some((s) => !s.block || !s.fill || !s.img || !s.word || !s.desc || !s.leader || !s.span) ||
          !steps[0].plan
        ) {
          return;
        }

        section.dataset.motion = "true"; // switches the CSS from a plain list to the pinned staircase

        const render = (t: number) => {
          const stacked = window.innerWidth < 768;
          const n = stacked ? 4 : 6; // slats per step

          steps.forEach(({ block, fill, img, plan, word, desc, leader, span }, i) => {
            if (!block || !fill || !img || !word || !desc || !leader || !span) return;
            const p = clamp01((t - STARTS[i]) / REVEAL);

            // What rises in slats. On the staircase it is the picture inside its sheet, so the empty sheet stays
            // on the page. On a phone the three sheets are stacked in one frame, so the whole sheet rises over the
            // one below. The other element carries no reveal styles. The plan (step one) is not revealed in slats:
            // it draws itself on its sheet.
            const rising = stacked ? block : fill;
            const idle = stacked ? fill : block;
            idle.style.clipPath = "";
            idle.style.visibility = "";
            if (i === 0) {
              rising.style.clipPath = "";
              rising.style.visibility = "visible";
            } else if (p <= 0) {
              rising.style.clipPath = "";
              rising.style.visibility = "hidden";
            } else {
              rising.style.visibility = "visible";
              rising.style.clipPath = p >= 1 ? "none" : slats(p, n, rising.clientWidth, rising.clientHeight);
            }
            block.dataset.empty = p <= 0 ? "true" : "false"; // shows the sheet's caption while it waits
            img.style.transform = `scale(${(1.05 - 0.05 * easeInOut(p)).toFixed(4)})`;

            // The plan draws itself as the step rises: walls fade in, lines draw on, labels arrive last
            if (i === 0 && plan) {
              plan.style.setProperty("--pw", ramp(p, 0.05, 0.4).toFixed(3));
              plan.style.setProperty("--d", (1 - ramp(p, 0.1, 0.85)).toFixed(3));
              plan.style.setProperty("--pt", ramp(p, 0.6, 1).toFixed(3));
            }

            // The duration string under the step: present from the start, it firms up when the step is done
            span.style.opacity = String((0.55 + 0.45 * ramp(p, 0.6, 1)).toFixed(3));

            // The annotation: the word firms up as its step starts, the leader is drawn to the sheet, and the
            // description is shown only while this is the active step
            word.style.opacity = String((0.45 + 0.55 * ramp(t, STARTS[i] - 0.1, STARTS[i] + 0.3)).toFixed(3));
            leader.style.transform = `scaleY(${(0.5 + 0.5 * ramp(t, STARTS[i] - 0.1, STARTS[i] + 0.5)).toFixed(3)})`;
            const inA = ramp(t, STARTS[i] + 0.25, STARTS[i] + 0.6);
            const outA = i < steps.length - 1 ? ramp(t, STARTS[i + 1], STARTS[i + 1] + 0.4) : 0;
            const a = inA * (1 - outA);
            const dy = ((1 - inA) * 14 - outA * 10).toFixed(2);
            desc.style.opacity = String(a.toFixed(3));
            desc.style.transform = `translateY(${dy}px)`;
            const md = mdescs[i];
            if (md) {
              md.style.opacity = String(a.toFixed(3));
              md.style.transform = `translateY(${dy}px)`;
            }
          });
        };

        const proxy = { t: 0 };
        render(0);

        gsap.to(proxy, {
          t: TOTAL,
          ease: "none",
          onUpdate: () => render(proxy.t),
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${TOTAL * 0.8 * window.innerHeight}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => render(proxy.t),
          },
        });

        return () => {
          section.dataset.motion = "false";
          // These styles were written directly, so they are cleared directly
          steps.forEach(({ block, fill, img, plan, word, desc, leader, span }) => {
            [block, fill].forEach((el) => {
              if (el) {
                el.style.visibility = "";
                el.style.clipPath = "";
              }
            });
            if (block) delete block.dataset.empty;
            [img, word, desc, leader, span].forEach((el) => {
              if (el) {
                el.style.opacity = "";
                el.style.transform = "";
              }
            });
            if (plan) ["--pw", "--d", "--pt"].forEach((v) => plan.style.removeProperty(v));
          });
          mdescs.forEach((el) => {
            el.style.opacity = "";
            el.style.transform = "";
          });
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="approach"
      data-motion="false"
      aria-labelledby="process-title"
      className="process relative bg-plaster text-umber"
    >
      <div className="pro-stage">
        <h2 id="process-title" className="sr-only">
          Our process
        </h2>

        <p className="pro-intro font-display">About nine months, from first measure to handover.</p>

        {/* The staircase: three complete pictures, each wider and taller than the last, on one baseline */}
        <div className="pro-stairs">
          {STEPS.map((s, i) => (
            <div key={s.word} className="pro-step" style={{ ["--w" as string]: s.w, ["--i" as string]: i }}>
              {/* The annotation, in the air above the step */}
              <div className="pro-label">
                <strong className="pro-word font-display">{s.word}</strong>
                <p className="pro-desc">
                  <span className="pro-copy">{s.copy}</span>
                </p>
                <span aria-hidden className="pro-leader" />
              </div>

              <figure className="pro-block m-0">
                {/* The empty sheet's caption, shown only while the step waits for its turn */}
                <span aria-hidden className="pro-sheet">
                  {s.sheet}
                </span>

                {/* What rises into the sheet */}
                <div className="pro-fill absolute inset-0">
                  <div className="pro-img absolute inset-0">
                    {i === 0 ? (
                      <PlanDrawing />
                    ) : (
                      <Image
                        src={SRC}
                        alt={i === 2 ? ALT : ""}
                        fill
                        fetchPriority="low"
                        sizes="(min-width: 768px) 38vw, 100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  {i === 1 ? <div aria-hidden className="absolute inset-0 bg-plaster/10" /> : null}

                  {/* Design: a plate of material swatches */}
                  {i === 1 ? (
                    <ul
                      aria-hidden
                      className="pro-chips pointer-events-none absolute bottom-4 left-4 m-0 flex list-none gap-2 bg-plaster p-2.5"
                    >
                      {SWATCHES.map((sw) => (
                        <li key={sw.name} className="w-16">
                          <span className="block aspect-square w-full" style={{ backgroundColor: sw.color }} />
                          <span className="mt-1 block text-xs leading-tight text-umber/80">{sw.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </figure>

              {/* An architectural dimension string under the step, giving its duration */}
              <div aria-hidden className="pro-span">
                <span className="pro-span-line" />
                <span className="pro-span-tick pro-span-tick-l" />
                <span className="pro-span-tick pro-span-tick-r" />
                <span className="pro-span-label">{s.span}</span>
              </div>
            </div>
          ))}
        </div>

        {/* On a phone the descriptions are shown together underneath the frame */}
        <div aria-hidden className="pro-mdescs">
          {STEPS.map((s) => (
            <p key={s.word} className="pro-mdesc">
              <span className="pro-copy">{s.copy}</span>
              <span className="pro-dur">{s.span}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
