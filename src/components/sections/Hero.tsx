"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Placeholder footage and photography. Replace with the studio's own project film and shots.
const VIDEO_HD = "https://videos.pexels.com/video-files/39024329/16605454_1920_1080_30fps.mp4";
const VIDEO_SD = "https://videos.pexels.com/video-files/39024329/16605453_1280_720_30fps.mp4";
// Source images are far larger than the tiles on purpose, so they stay crisp on retina screens.
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

// Tiles run left to right. The last tile is the video.
const TILES: readonly ({ kind: "photo"; id: string } | { kind: "video" })[] = [
  { kind: "photo", id: "1606744837616-56c9a5c6a6eb" },
  { kind: "photo", id: "1564078516393-cf04bd966897" },
  { kind: "photo", id: "1622372738946-62e02505feb3" },
  { kind: "photo", id: "1552558636-f6a8f071c2b3" },
  { kind: "photo", id: "1507652313519-d4e9174996dd" },
  { kind: "photo", id: "1599696848652-f0ff23bc911f" },
  { kind: "photo", id: "1604578762246-41134e37f9cc" },
  { kind: "video" },
];
const VIDEO_INDEX = TILES.length - 1;

// Timeline (seconds)
const T_WAVE = 0.75; // first tile starts to jump
const STEP = 0.2; // delay between neighbouring jumps
const JUMP_LEN = 0.66; // up, down, small rebound
const T_CONVERGE = T_WAVE + (TILES.length - 1) * STEP + JUMP_LEN + 0.25; // tiles sit aligned for a beat first
const CONVERGE_LEN = 0.95;

/**
 * Loader and hero are ONE piece, so the handoff is seamless.
 *
 * 1. A straight row of small square tiles (seven photos, then the playing video) fades in on a stone screen.
 * 2. Like a loader, the tiles jump one after another, left to right, while the counter climbs to 100.
 * 3. At 100 the row settles back into a straight line, then slides together into one stack. The video tile
 *    is last in the row and on top of the stack.
 * 4. The video tile opens to full bleed. Copy rises in, the nav arrives.
 * 5. Scroll: hero pins, the video drifts forward and darkens, copy lifts away.
 *
 * The video tile is a viewport-sized element scaled down with a UNIFORM transform and cropped square with
 * clip-path, so it is never stretched and opens without a jump. Only transform, opacity and clip-path animate.
 * Scroll is locked until the intro ends. Reduced motion skips the intro and the autoplay and shows the
 * full-bleed hero straight away.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = root.current;
    const videoEl = video.current;
    const scrimEl = scrim.current;
    const dimEl = dim.current;
    const counterEl = counter.current;
    const contentEl = content.current;
    if (!section || !videoEl || !scrimEl || !dimEl || !counterEl || !contentEl) return;

    const html = document.documentElement;

    // A reload must replay the loader from the top
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // 1080p on big screens, 720p otherwise
    videoEl.src = window.innerWidth >= 1100 ? VIDEO_HD : VIDEO_SD;

    let cancelled = false;
    let expandTl: gsap.core.Timeline | undefined;
    let scrollTl: gsap.core.Timeline | undefined;
    const killLate = () => {
      cancelled = true;
      expandTl?.kill();
      scrollTl?.scrollTrigger?.kill(true);
      scrollTl?.kill();
    };

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (c) => {
          section.dataset.ready = "true";

          const tiles = gsap.utils.toArray<HTMLElement>(".g-card", section);
          const vCard = tiles[VIDEO_INDEX];
          const chrome = gsap.utils.toArray<HTMLElement>(".hero-chrome", section);
          const lines = gsap.utils.toArray<HTMLElement>(".hero-line > span", section);
          const fades = gsap.utils.toArray<HTMLElement>(".hero-fade", section);
          const imgs = gsap.utils.toArray<HTMLElement>(".g-img", section);

          // Reduced motion: no loader, no autoplay (first frame stays still), static full-bleed hero
          if (c.conditions?.reduce) {
            tiles.forEach((el, i) => {
              if (i === VIDEO_INDEX) el.dataset.final = "true";
              else gsap.set(el, { autoAlpha: 0 });
            });
            gsap.set(chrome, { autoAlpha: 0 });
            gsap.set(scrimEl, { opacity: 1 });
            html.dataset.loading = "false";
            return;
          }

          html.dataset.loading = "true";
          html.style.overflow = "hidden";
          void videoEl.play().catch(() => {});

          const W = section.clientWidth;
          const H = section.clientHeight;
          const small = W < 768;

          // Square tile size and spacing. On phones the row must still fit with a margin.
          const tile = small ? 36 : Math.min(64, Math.max(40, W * 0.036));
          const gap = small ? 6 : Math.round(tile * 0.4);
          const pitch = tile + gap;
          const jump = tile * 1.5; // how high a tile leaps
          const xAt = (i: number) => (i - (TILES.length - 1) / 2) * pitch; // row is centred on the screen

          // The video tile is a viewport-sized element (at least as wide as tall) scaled down to the tile
          // and clipped to a square, so no part of it is ever stretched.
          const wV = Math.max(W, H);
          const crop = (visibleW: number) => {
            const i = (wV - visibleW) / 2;
            return `inset(0px ${i}px 0px ${i}px)`;
          };

          tiles.forEach((el, i) => {
            const isV = i === VIDEO_INDEX;
            gsap.set(el, {
              width: isV ? wV : tile,
              height: isV ? H : tile,
              xPercent: -50,
              yPercent: -50,
              x: xAt(i),
              y: 20,
              scale: isV ? tile / H : 1,
              clipPath: isV ? crop(H) : "none",
              autoAlpha: 0,
              zIndex: isV ? 20 : i + 1,
            });
          });
          gsap.set(chrome, { autoAlpha: 0, y: 12 });
          gsap.set(lines, { yPercent: 115 });
          gsap.set(fades, { autoAlpha: 0, y: 22 });
          gsap.set(scrimEl, { opacity: 0 });

          // Resolve when the video can play, or after 7s so a slow connection never traps the visitor
          const ready = new Promise<void>((resolve) => {
            if (videoEl.readyState >= 3) {
              resolve();
              return;
            }
            videoEl.addEventListener("canplay", () => resolve(), { once: true });
            window.setTimeout(resolve, 7000);
          });

          const finish = () => {
            // Hand the video tile over to plain CSS so it stays responsive on resize
            tiles.forEach((el, i) => {
              if (i !== VIDEO_INDEX) gsap.set(el, { autoAlpha: 0 });
            });
            gsap.set(vCard, { clearProps: "all" });
            vCard.dataset.final = "true";
            html.style.overflow = "";
            scrollTl = gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: section, start: "top top", end: "+=90%", pin: true, scrub: 0.6 },
              })
              .to(vCard, { scale: 1.12, duration: 1 }, 0)
              .to(dimEl, { opacity: 0.55, duration: 1 }, 0)
              .to(contentEl, { yPercent: -12, autoAlpha: 0, duration: 0.5, ease: "power1.in" }, 0);
            ScrollTrigger.refresh();
          };

          // 4. The video tile opens to full bleed
          const expand = () => {
            expandTl = gsap
              .timeline({ onComplete: finish })
              .to(vCard, { scale: 1, clipPath: crop(W), duration: 1.5, ease: "expo.inOut" }, 0)
              .to(scrimEl, { opacity: 1, duration: 1.1, ease: "power2.out" }, 0.8)
              .call(() => {
                html.dataset.loading = "false"; // brings the nav in
              }, undefined, 1.0)
              .to(lines, { yPercent: 0, duration: 1.4, stagger: 0.12, ease: "expo.out" }, 0.9)
              .to(fades, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.12, ease: "expo.out" }, 1.3);
          };

          const count = { v: 0 };
          const setCount = () => {
            counterEl.textContent = String(Math.round(count.v)).padStart(3, "0");
          };
          const intro = gsap.timeline();

          // 1. Row fades in, aligned
          intro.to(tiles, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 }, 0);
          intro.fromTo(imgs, { scale: 1.3 }, { scale: 1, duration: 1.4, ease: "expo.out", stagger: 0.05 }, 0);
          intro.to(chrome, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "expo.out" }, 0.15);

          // 2. Loader wave: each tile leaps, lands, rebounds slightly; the counter advances with every leap
          tiles.forEach((el, i) => {
            const t = T_WAVE + i * STEP;
            intro
              .to(el, { y: -jump, duration: 0.28, ease: "power3.out" }, t)
              .to(el, { y: 0, duration: 0.22, ease: "power2.in" }, t + 0.28)
              .to(el, { y: -jump * 0.14, duration: 0.08, ease: "power2.out" }, t + 0.5)
              .to(el, { y: 0, duration: 0.08, ease: "power2.in" }, t + 0.58);
            intro.to(
              count,
              { v: ((i + 1) / TILES.length) * 100, duration: 0.3, ease: "power1.out", onUpdate: setCount },
              t,
            );
          });

          // 3. At 100 the row is straight; slide everything together, video on top (it has the highest z-index)
          intro.to(chrome, { autoAlpha: 0, y: -10, duration: 0.5, ease: "power2.in" }, T_CONVERGE);
          intro.to(
            tiles,
            { x: 0, duration: CONVERGE_LEN, ease: "expo.inOut", stagger: { each: 0.03, from: "edges" } },
            T_CONVERGE,
          );

          // Wait for the video if it is not ready yet, then open it
          intro.call(
            () => {
              void ready.then(() => {
                if (!cancelled) expand();
              });
            },
            undefined,
            T_CONVERGE + CONVERGE_LEN + 0.25,
          );

          return () => {
            killLate();
            html.style.overflow = "";
          };
        },
      );
    }, section);

    return () => {
      killLate();
      ctx.revert();
      html.style.overflow = "";
      html.dataset.loading = "false";
    };
  }, []);

  return (
    <section
      ref={root}
      id="top"
      data-ready="false"
      aria-labelledby="hero-title"
      className="hero relative h-[100dvh] min-h-[620px] overflow-hidden bg-stone"
    >
      {/* Loader chrome, shown on the stone screen */}
      <span
        aria-hidden
        className="hero-chrome absolute left-1/2 top-7 -translate-x-1/2 font-display text-[1.5rem] leading-none text-umber"
      >
        Hallam &amp; Wren
      </span>
      <span
        ref={counter}
        aria-hidden
        className="hero-chrome absolute left-1/2 top-[calc(50%+4.5rem)] -translate-x-1/2 font-display text-[clamp(1.25rem,1.7vw,1.75rem)] leading-none text-umber [font-variant-numeric:lining-nums_tabular-nums]"
      >
        000
      </span>

      {/* Stage: the tile row (the last tile is the playing video), scrim and dim for legibility */}
      <div aria-hidden className="absolute inset-0 isolate">
        {TILES.map((tileItem, i) =>
          tileItem.kind === "video" ? (
            <div key="video" className="g-card absolute left-1/2 top-1/2">
              <video
                ref={video}
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <div key={tileItem.id} className="g-card absolute left-1/2 top-1/2 overflow-hidden" data-index={i}>
              <div className="g-img absolute inset-0">
                <Image
                  src={photo(tileItem.id)}
                  alt=""
                  fill
                  unoptimized
                  priority
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            </div>
          ),
        )}
        <div
          ref={scrim}
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber/80 via-umber/20 to-umber/10"
          style={{ zIndex: 30 }}
        />
        <div
          ref={dim}
          className="pointer-events-none absolute inset-0 bg-umber opacity-0"
          style={{ zIndex: 31 }}
        />
      </div>

      {/* Hero copy */}
      <div ref={content} className="absolute inset-0 z-10">
        <div className="absolute inset-x-0 bottom-0 px-5 pb-[7dvh] md:px-[5vw] md:pb-[8dvh]">
          <div className="grid items-end gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:gap-10">
            <h1
              id="hero-title"
              className="font-display text-[clamp(2.9rem,7.6vw,9rem)] font-normal leading-[0.95] tracking-[-0.02em] text-plaster"
            >
              <span className="hero-line -mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="block">Rooms composed</span>
              </span>
              <span className="hero-line -mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="block">to be lived in.</span>
              </span>
            </h1>

            <div>
              <p className="hero-fade max-w-[38ch] text-balance text-[15px] leading-relaxed text-plaster/85 md:text-base">
                A London studio designing and delivering private residences end to end. 140 homes
                completed in 18 years.
              </p>
              <div className="hero-fade mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 md:mt-8">
                <MagneticLink href="#contact" variant="light">
                  Book a consultation
                </MagneticLink>
                <MagneticLink href="#projects" variant="quiet-light">
                  View projects
                </MagneticLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
