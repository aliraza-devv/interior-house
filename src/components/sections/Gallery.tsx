"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { easeInOut, ramp, slats, clamp01 } from "@/lib/fluted";
import { gsap } from "@/lib/gsap";
import { unsplash } from "@/lib/photos";
import { PROJECTS } from "@/lib/projects";

// Cropped to the 3:2 the pan layer is, on the image host, so no pixel is sent that is never shown
const photo = (id: string) => unsplash(id, [3, 2]);

// Timeline units. One unit of scroll is 80% of a viewport height.
const T0 = 0.35; // the title holds still for this long
const REVEAL = 0.85; // one photograph rising in
const GAP = 1; // start-to-start between photographs (so each one rests for 0.15)
const TAIL = 0.55; // after the last photograph lands, hold for the button
const PHOTO_ASPECT = 1.5; // width / height of the photographs (3:2), used to size the pan layer

/**
 * "Fluted". Reeded timber panelling is a signature of luxury interiors, so each project is revealed the way a
 * fluted wall opens: the photograph rises in a row of slats, centre first.
 *
 * Each project is a gallery plate: a very large framed photograph (about 93% of the width and 75% of the height
 * of the screen) with a one-row caption underneath. A wide frame would crop the room, so the photograph is sized
 * to a natural 3:2 box that is larger than the frame and glides through it for as long as the project is on
 * screen: ceiling and windows first, floor and furniture last. On a phone it pans sideways instead.
 *
 * The section pins and the scroll position drives everything through one render function, so there is nothing
 * to fall out of sync. A slim ruler in the right margin (one tick per project, the current one extended) shows
 * where you are. Only transform, opacity and clip-path change. Without JavaScript or with reduced motion the
 * section is a plain vertical stack of 3:2 photographs with their captions.
 */
export function Gallery() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const wins = gsap.utils.toArray<HTMLElement>(".gal-win", section);
        const title = section.querySelector<HTMLElement>(".gal-title");
        const rule = section.querySelector<HTMLElement>(".gal-rule");
        const ticks = gsap.utils.toArray<HTMLElement>(".gal-tick", section);
        if (!wins.length || !title || !rule) return;

        const parts = wins.map((win) => ({
          frame: win.querySelector<HTMLElement>(".gal-frame"),
          img: win.querySelector<HTMLElement>(".gal-img"),
          pan: win.querySelector<HTMLElement>(".gal-pan"),
          dim: win.querySelector<HTMLElement>(".gal-dim"),
          copy: win.querySelector<HTMLElement>(".gal-copy"),
        }));
        if (parts.some((p) => !p.frame || !p.img || !p.pan || !p.dim || !p.copy)) return;

        section.dataset.motion = "true"; // switches the CSS from a plain stack to the pinned stage

        // Everything is drawn in the frame's own pixels, so measure the frame itself
        let W = 0;
        let H = 0;
        let n = 14;
        let rangeX = 0; // how far the pan layer can travel sideways (phones)
        let rangeY = 0; // how far it can travel vertically (wide screens)
        const measure = () => {
          const f = parts[0].frame;
          W = f ? f.clientWidth : 0;
          H = f ? f.clientHeight : 0;
          n = window.innerWidth < 768 ? 8 : 14;

          // The pan layer is a 3:2 box that covers the frame. It overflows the shorter axis, and that overflow
          // is the distance the photograph travels, so the whole room is shown over time.
          let panW = W;
          let panH = W / PHOTO_ASPECT;
          if (W / Math.max(H, 1) < PHOTO_ASPECT) {
            panH = H;
            panW = H * PHOTO_ASPECT;
          }
          rangeX = Math.max(0, panW - W);
          rangeY = Math.max(0, panH - H);
          parts.forEach(({ pan }) => {
            if (!pan) return;
            pan.style.width = `${panW}px`;
            pan.style.height = `${panH}px`;
          });
        };
        measure();

        const total = T0 + (wins.length - 1) * GAP + REVEAL + TAIL;
        let active = -1;

        const render = (t: number) => {
          const p = wins.map((_, k) => clamp01((t - (T0 + k * GAP)) / REVEAL));

          wins.forEach((win, k) => {
            const pk = p[k];
            const { frame, img, pan, dim, copy } = parts[k];
            if (!frame || !img || !pan || !dim || !copy) return;

            if (pk <= 0) {
              win.style.visibility = "hidden";
              return;
            }
            win.style.visibility = "visible";
            frame.style.clipPath = pk >= 1 ? "none" : slats(pk, n, W, H);

            // Settles from a slight zoom as it lands; recedes and darkens as the next room covers it
            const next = k + 1 < wins.length ? p[k + 1] : 0;
            const settle = 1.07 - 0.07 * easeInOut(pk);
            img.style.transform = `scale(${settle + 0.05 * easeInOut(next)})`;
            dim.style.opacity = String(0.55 * easeInOut(next));

            // The pan: from the top (or left) edge of the photograph to the bottom (or right) edge, over the
            // whole time this project is the one on screen
            const start = T0 + k * GAP;
            const life = k + 1 < wins.length ? GAP : REVEAL + TAIL;
            const u = clamp01((t - start) / life);
            pan.style.transform = `translate3d(${(-rangeX * u).toFixed(2)}px, ${(-rangeY * u).toFixed(2)}px, 0)`;

            // Caption arrives as the last slats land and leaves as the next photograph starts
            const inA = ramp(pk, 0.7, 1);
            const outA = ramp(next, 0, 0.3);
            copy.style.opacity = String(inA * (1 - outA));
            copy.style.transform = `translateY(${(1 - inA) * 24 - outA * 14}px)`;
          });

          // The title is covered by the first photograph
          title.style.opacity = String(1 - ramp(p[0], 0.2, 0.6));
          title.style.transform = `scale(${1 + 0.04 * p[0]})`;

          // The ruler appears with the first photograph, and the tick for the current project extends
          rule.style.opacity = String(ramp(p[0], 0.3, 0.6));
          let current = -1;
          p.forEach((pk, k) => {
            if (pk >= 0.55) current = k;
          });
          if (current !== active) {
            active = current;
            ticks.forEach((tick, i) => tick.classList.toggle("is-active", i === current));
          }
        };

        const proxy = { t: 0 };
        render(0);

        gsap.to(proxy, {
          t: total,
          ease: "none",
          onUpdate: () => render(proxy.t),
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${total * 0.8 * window.innerHeight}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              measure();
              render(proxy.t);
            },
          },
        });

        return () => {
          section.dataset.motion = "false";
          // These styles were written directly, so they are cleared directly
          [title, rule].forEach((el) => {
            el.style.opacity = "";
            el.style.transform = "";
          });
          wins.forEach((win, k) => {
            win.style.visibility = "";
            const { frame, img, pan, dim, copy } = parts[k];
            if (frame) frame.style.clipPath = "";
            if (pan) {
              pan.style.width = "";
              pan.style.height = "";
            }
            [img, pan, dim, copy].forEach((el) => {
              if (el) {
                el.style.opacity = "";
                el.style.transform = "";
              }
            });
          });
          ticks.forEach((tick) => tick.classList.remove("is-active"));
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="projects"
      data-motion="false"
      aria-labelledby="projects-title"
      className="gallery relative bg-stone"
    >
      <div className="gal-stage relative isolate">
        <h2
          id="projects-title"
          className="gal-title font-display text-[clamp(5rem,21vw,24rem)] font-normal leading-[0.9] text-umber"
        >
          Projects
        </h2>

        {PROJECTS.map((p, i) => {
          const last = i === PROJECTS.length - 1;
          return (
            <article key={p.name} className="gal-win" style={{ zIndex: i + 1 }}>
              <figure className="gal-frame m-0">
                <div className="gal-img absolute inset-0">
                  <div className="gal-pan">
                    <Image
                      src={photo(p.id)}
                      alt={p.alt}
                      fill
                      fetchPriority="low" // below the fold: it must never compete with the hero film and the loader
                      sizes="95vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div aria-hidden className="gal-dim pointer-events-none absolute inset-0 bg-umber opacity-0" />
              </figure>

              {/* One-row caption under the photograph: name, details, and on the last project the button */}
              <div className="gal-copy grid items-start gap-y-3 text-umber md:grid-cols-12 md:gap-x-0">
                <h3 className="font-display text-[clamp(2.2rem,4.6vw,5.75rem)] font-normal leading-[0.95] md:col-span-6">
                  {p.name}
                </h3>
                <p className="text-[14px] leading-snug text-umber/80 md:col-span-3 md:col-start-7 md:pt-[0.7em] md:text-[15px]">
                  <span className="block">{p.place}</span>
                  <span className="block">
                    {p.kind}, {p.year}
                  </span>
                </p>
                {last ? (
                  <div className="mt-2 md:col-span-3 md:col-start-10 md:mt-0 md:justify-self-end md:pt-[0.2em]">
                    <MagneticLink href="/projects" variant="stone">
                      View all projects
                    </MagneticLink>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}

        {/* An architect's scale rule in the right margin: one tick per project, the current one extended */}
        <div
          aria-hidden
          className="gal-rule pointer-events-none absolute right-[0.7vw] top-1/2 z-[20] -translate-y-1/2 flex-col items-end gap-3.5"
        >
          {PROJECTS.map((p) => (
            <span key={p.name} className="gal-tick block h-px w-10 bg-umber" />
          ))}
        </div>
      </div>
    </section>
  );
}
