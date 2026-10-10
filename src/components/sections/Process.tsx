"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { LineCta } from "@/components/ui/LineCta";
import { gsap } from "@/lib/gsap";

// Placeholder photograph. The same room is shown in three states, so one strong portrait photograph is enough.
const SRC =
  "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1400&q=80";
const ALT = "Pale stone staircase beside a tall plant and a green armchair";

const STEPS = [
  {
    word: "Draw",
    copy: "We begin with a tape measure and a pencil. Plans are drawn and redrawn until every room works before it looks good.",
  },
  {
    word: "Design",
    copy: "Materials, light and colour are chosen together on one board, so nothing is decided in isolation.",
  },
  {
    word: "Build",
    copy: "Our own craftspeople fit every detail on site, with one lead accountable until the day we hand over.",
  },
] as const;

// Illustrative material swatches shown in the Design step
const SWATCHES = [
  { name: "Lime plaster", color: "#e4ddcf" },
  { name: "Smoked oak", color: "#5b4636" },
  { name: "Travertine", color: "#d2c3aa" },
  { name: "Moss linen", color: "#8a8870" },
  { name: "Bronze", color: "#7a5c42" },
] as const;

// Timeline: progress P runs 0 to 3 (one unit per step), then holds briefly on the finished room
const TOTAL = 3.35;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/**
 * "One room, three states". The section pins, and one photograph moves through the whole process:
 *
 *   Draw    a grey, veiled print like tracing paper, with dimension lines and a scale bar
 *   Design  the photograph warms toward colour; the drawing marks give way to material swatches
 *   Build   the finished room in full colour
 *
 * The three huge words start as outlines (only drawn) and fill solid as their step begins. A word that has
 * been built stays solid but steps back, and the one in progress steps forward.
 *
 * Everything is driven by one render function from the scroll position. Only opacity and transform change
 * (the grey state is a second, statically filtered copy of the photograph that fades out, so there is no
 * animated filter). Without JavaScript or with reduced motion the section is a plain static layout.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = <T extends HTMLElement>(sel: string) => section.querySelector<T>(sel);
        const words = gsap.utils.toArray<HTMLElement>(".pro-word", section).map((el) => ({
          el,
          outline: el.querySelector<HTMLElement>(".pro-outline"),
          solid: el.querySelector<HTMLElement>(".pro-solid"),
        }));
        const copies = gsap.utils.toArray<HTMLElement>(".pro-copy", section);
        const dims = q(".pro-dims");
        const chips = q(".pro-chips");
        const cta = q(".pro-cta");
        const gray = q(".pro-gray");
        const veil = q(".pro-veil");
        const img = q(".pro-img");
        if (!dims || !chips || !cta || !gray || !veil || !img || words.some((w) => !w.outline || !w.solid)) return;

        section.dataset.motion = "true"; // switches the CSS from a static layout to the pinned stage

        const render = (t: number) => {
          const P = Math.min(t, 3);

          // Words: outline until their step begins, then solid; the one in progress steps forward
          words.forEach(({ el, outline, solid }, i) => {
            if (!outline || !solid) return;
            const done = ramp(P, i, i + 0.35);
            const past = ramp(P, i + 1, i + 1.35);
            outline.style.opacity = String(1 - done);
            solid.style.opacity = String(done * (1 - 0.55 * past));
            el.style.transform = `translate3d(${(done * (1 - past) * 22).toFixed(2)}px, 0, 0)`;
          });

          // Copy: crossfades, one sentence per step
          copies.forEach((c, i) => {
            const inA = ramp(P, i + 0.15, i + 0.4);
            const outA = i < copies.length - 1 ? ramp(P, i + 0.8, i + 1.0) : 0;
            c.style.opacity = String(inA * (1 - outA));
            c.style.transform = `translateY(${((1 - inA) * 18 - outA * 12).toFixed(2)}px)`;
          });

          // The drawing marks leave, the swatches come and go, the call to action arrives with the finished room
          dims.style.opacity = String(1 - ramp(P, 0.7, 1.1));
          chips.style.opacity = String(ramp(P, 0.9, 1.25) * (1 - ramp(P, 1.8, 2.1)));
          const ctaA = ramp(P, 2.1, 2.5);
          cta.style.opacity = String(ctaA);
          cta.style.visibility = ctaA > 0.01 ? "visible" : "hidden";

          // The photograph: grey and veiled (Draw), partly warmed (Design), full colour (Build)
          gray.style.opacity = String(P < 1.25 ? 1 - 0.6 * ramp(P, 0.7, 1.25) : 0.4 * (1 - ramp(P, 1.7, 2.2)));
          veil.style.opacity = String(0.35 * (1 - ramp(P, 0.5, 1.1)));
          img.style.transform = `scale(${(1.05 - 0.05 * ramp(P, 0, 2.2)).toFixed(4)})`;
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
            end: () => `+=${TOTAL * 0.85 * window.innerHeight}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          section.dataset.motion = "false";
          // These styles were written directly, so they are cleared directly
          const els: (HTMLElement | null)[] = [
            ...words.flatMap((w) => [w.el, w.outline, w.solid]),
            ...copies,
            dims,
            chips,
            cta,
            gray,
            veil,
            img,
          ];
          els.forEach((el) => {
            if (!el) return;
            el.style.opacity = "";
            el.style.transform = "";
            el.style.visibility = "";
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

        <div className="pro-left">
          {/* The three words: outlined while they are only drawn, solid once built */}
          <ol className="pro-words m-0 list-none p-0">
            {STEPS.map((s) => (
              <li key={s.word} className="pro-word relative font-display leading-[0.9] tracking-[-0.025em]">
                <span aria-hidden className="pro-outline absolute left-0 top-0">
                  {s.word}
                </span>
                <span className="pro-solid block">{s.word}</span>
              </li>
            ))}
          </ol>

          <div className="pro-copy-wrap">
            {STEPS.map((s) => (
              <p key={s.word} className="pro-copy text-[clamp(1.05rem,1.35vw,1.4rem)] leading-[1.45] text-umber">
                {s.copy}
              </p>
            ))}
          </div>

          <div className="pro-cta">
            <LineCta href="#contact" tone="umber">
              Book a consultation
            </LineCta>
          </div>
        </div>

        <div className="pro-right">
          <figure className="pro-frame m-0">
            <div className="pro-img absolute inset-0 overflow-hidden">
              <Image src={SRC} alt={ALT} fill unoptimized sizes="40vw" className="object-cover" />
              {/* Draw: the same photograph, grey and high contrast, under a veil of plaster like tracing paper */}
              <div aria-hidden className="pro-gray absolute inset-0">
                <Image
                  src={SRC}
                  alt=""
                  fill
                  unoptimized
                  sizes="40vw"
                  className="object-cover brightness-110 contrast-125 grayscale"
                />
              </div>
              <div aria-hidden className="pro-veil absolute inset-0 bg-plaster opacity-0" />
            </div>

            {/* Drawing marks: dimension lines and a scale bar, shown in the Draw step */}
            <div aria-hidden className="pro-dims pointer-events-none">
              <div className="pro-dim-top absolute left-0 right-0 -top-9 h-5">
                <span className="absolute left-0 right-0 top-1/2 h-px bg-umber/45" />
                <span className="absolute left-0 top-0 h-full w-px bg-umber/60" />
                <span className="absolute right-0 top-0 h-full w-px bg-umber/60" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-plaster px-3 text-[11px] tracking-[0.14em] text-umber/80 [font-variant-numeric:tabular-nums]">
                  3,850
                </span>
              </div>
              <div className="pro-dim-left absolute -left-9 bottom-0 top-0 w-5">
                <span className="absolute bottom-0 left-1/2 top-0 w-px bg-umber/45" />
                <span className="absolute left-0 top-0 h-px w-full bg-umber/60" />
                <span className="absolute bottom-0 left-0 h-px w-full bg-umber/60" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-plaster py-2 text-[11px] tracking-[0.14em] text-umber/80 [font-variant-numeric:tabular-nums]">
                  4,900
                </span>
              </div>
              <div className="pro-scale absolute left-0 top-[calc(100%+1.1rem)] w-44">
                <div className="relative h-3 border-b border-umber/60">
                  {[0, 25, 50, 75, 100].map((p) => (
                    <span key={p} className="absolute bottom-0 h-2 w-px bg-umber/60" style={{ left: `${p}%` }} />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] tracking-[0.1em] text-umber/80 [font-variant-numeric:tabular-nums]">
                  <span>0</span>
                  <span>1</span>
                  <span>2 m</span>
                </div>
              </div>
            </div>

            {/* Material swatches, shown in the Design step */}
            <ul
              aria-hidden
              className="pro-chips pointer-events-none absolute left-0 right-0 top-[calc(100%+1.1rem)] m-0 flex list-none gap-3 p-0 opacity-0"
            >
              {SWATCHES.map((s) => (
                <li key={s.name} className="min-w-0 flex-1">
                  <span className="block aspect-square w-full" style={{ backgroundColor: s.color }} />
                  <span className="mt-1.5 block truncate text-[11px] leading-tight text-umber/80">{s.name}</span>
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </div>
    </section>
  );
}
