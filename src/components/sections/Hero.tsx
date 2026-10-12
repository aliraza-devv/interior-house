"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ABOUT_IMAGE, ABOUT_IMAGE_ASPECT, ABOUT_IMAGE_SIZES } from "@/lib/media";
import { motionPaused } from "@/lib/motion";
import { PHOTOS, unsplash } from "@/lib/photos";

// Placeholder footage. Replace with the studio's own project film, compressed and hosted on the site's own domain.
const VIDEO_HD = "https://videos.pexels.com/video-files/39024329/16605454_1920_1080_30fps.mp4"; // 3.7 MB
const VIDEO_SD = "https://videos.pexels.com/video-files/39024329/16605453_1280_720_30fps.mp4"; // 1.4 MB

// 1080p only where the screen can really show it (1920 physical pixels across: a full-HD monitor or a retina laptop)
// and the visitor has not asked to save data. Everything else gets 720p, which is a third of the weight.
const wantsHd = () => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  return window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) >= 1920;
};

// Tiles run left to right; the last tile is the video. A mix of light and dark rooms.
const TILES: readonly ({ kind: "photo"; id: string } | { kind: "video" })[] = [
  { kind: "photo", id: PHOTOS.wren.id },
  { kind: "photo", id: PHOTOS.room.id },
  { kind: "photo", id: PHOTOS.minimal.id },
  { kind: "photo", id: PHOTOS.marlow.id },
  { kind: "photo", id: PHOTOS.highgate.id },
  { kind: "photo", id: PHOTOS.cadogan.id },
  { kind: "photo", id: PHOTOS.kew.id },
  { kind: "video" },
];
const VIDEO_INDEX = TILES.length - 1;
const OVERSCAN = 4; // px of horizontal overscan on the full-bleed video, so no sub-pixel sliver can show

// Timeline (seconds). The whole intro takes about four seconds before the page is free to scroll.
const T_WAVE = 0.4; // first tile starts to jump
const STEP = 0.11; // delay between neighbouring jumps
const JUMP_LEN = 0.58; // up, down, small rebound
const T_CONVERGE = T_WAVE + (TILES.length - 1) * STEP + JUMP_LEN + 0.12; // tiles sit aligned for a beat first
const CONVERGE_LEN = 0.75;
const EXPAND_LEN = 1.25; // the film opens to full bleed; scroll is released the moment it has

/**
 * Loader and hero are ONE piece, so the handoff is seamless.
 *
 * 1. A straight row of small square tiles (seven photos, then the playing video) fades in on a stone screen.
 * 2. Like a loader, the tiles jump one after another, left to right, while the counter climbs to 100.
 * 3. At 100 the row settles back into a straight line, then slides together into one stack. The video tile
 *    is last in the row and on top of the stack.
 * 4. The video tile opens to full bleed. Scroll is released as soon as it has; the copy keeps arriving, the nav
 *    comes in, and "hero:intro-complete" fires.
 * 5. StoryScroll (separate component) then morphs the video card into the About image on scroll.
 *
 * Nobody has to wait for it: a "Skip intro" button, Escape, a click, or any attempt to scroll runs it out at speed.
 * A link to a section (a shared /#faq) skips it altogether and lands on that section. Reduced motion, or the visitor's
 * own "pause motion" choice, skips the intro and the autoplay and shows the full-bleed hero straight away.
 *
 * The video tile is a viewport-sized element scaled down with a UNIFORM transform and cropped square with
 * clip-path, so it is never stretched and opens without a jump. Only transform, opacity and clip-path animate.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const skipIntro = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const section = root.current;
    const videoEl = video.current;
    const scrimEl = scrim.current;
    const counterEl = counter.current;
    if (!section || !videoEl || !scrimEl || !counterEl) return;

    const html = document.documentElement;
    const body = document.body;
    // Scroll lock that does not touch the scrollbar: the body is pinned, the (always visible) track stays disabled
    const lock = () => {
      body.style.position = "fixed";
      body.style.top = "0";
      body.style.left = "0";
      body.style.width = "100%";
    };
    const unlock = () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.width = "";
    };

    // A link to a section skips the intro and lands there; otherwise a reload replays the loader from the top
    const hash = window.location.hash.slice(1);
    const target = hash && hash !== "top" ? document.getElementById(decodeURIComponent(hash)) : null;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!target) window.scrollTo(0, 0);

    videoEl.src = wantsHd() ? VIDEO_HD : VIDEO_SD;

    let cancelled = false;
    let finished = false;
    let expandTl: gsap.core.Timeline | undefined;
    const timers: number[] = [];
    const gestures = new AbortController();
    const killLate = () => {
      cancelled = true;
      expandTl?.kill();
      gestures.abort();
      timers.forEach((t) => window.clearTimeout(t));
    };

    // The page's looping motion can be paused from the menu; the film follows once it is playing
    const onMotion = () => {
      if (html.dataset.loading === "true") return;
      const card = videoEl.parentElement;
      if (motionPaused()) videoEl.pause();
      else if (card && getComputedStyle(card).visibility !== "hidden") void videoEl.play().catch(() => {});
    };
    window.addEventListener("motion:change", onMotion);

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
          const draws = gsap.utils.toArray<HTMLElement>(".hero-draw", section);
          const imgs = gsap.utils.toArray<HTMLElement>(".g-img", section);
          const flutesWrap = section.querySelector<HTMLElement>(".hero-flutes");
          const flutes = gsap.utils.toArray<HTMLElement>(".flute", section);
          const glints = gsap.utils.toArray<HTMLElement>(".flute i", section);

          const calm = Boolean(c.conditions?.reduce) || motionPaused();

          // No intro: reduced motion, a paused page, or a link to a section. The hero is simply there, full bleed.
          if (calm || target) {
            gsap.set(flutesWrap, { autoAlpha: 0 });
            tiles.forEach((el, i) => {
              if (i === VIDEO_INDEX) el.dataset.final = "true";
              else gsap.set(el, { autoAlpha: 0 });
            });
            gsap.set(chrome, { autoAlpha: 0 });
            gsap.set(scrimEl, { opacity: 1 });
            html.dataset.loading = "false";
            // Scrolling is the visitor's own motion, so the scroll-driven morph into About still runs unless the device
            // asks for no motion at all
            if (!c.conditions?.reduce) {
              html.dataset.intro = "done";
              window.dispatchEvent(new Event("hero:intro-complete"));
            }

            if (target && !calm) {
              void videoEl.play().catch(() => {});
              // The pinned sections change the page's height once they are set up, so jump after that, not before.
              // The second pass settles it after fonts and images, but never fights a visitor who has started scrolling.
              let landed = -1;
              const jump = (again: boolean) => {
                if (again && Math.abs(window.scrollY - landed) > 4) return;
                ScrollTrigger.refresh();
                window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
                landed = window.scrollY;
              };
              timers.push(window.setTimeout(() => jump(false), 150));
              timers.push(window.setTimeout(() => jump(true), 900));
            }
            return;
          }

          html.dataset.loading = "true";
          lock();
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
          const wV = Math.max(W + OVERSCAN, H);
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
          gsap.set(draws, { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(scrimEl, { opacity: 0 });

          // Resolves when the video can play, or after 4.5s so a slow connection never traps the visitor
          let skipped = false;
          let resolveReady: () => void = () => {};
          const ready = new Promise<void>((resolve) => {
            resolveReady = resolve;
            if (videoEl.readyState >= 3) {
              resolve();
              return;
            }
            videoEl.addEventListener("canplay", () => resolve(), { once: true });
            timers.push(window.setTimeout(resolve, 4500));
          });

          const finish = () => {
            if (finished) return;
            finished = true;
            gestures.abort();
            // Hand the video tile over to plain CSS so it stays responsive on resize
            tiles.forEach((el, i) => {
              if (i !== VIDEO_INDEX) gsap.set(el, { autoAlpha: 0 });
            });
            gsap.set(vCard, { clearProps: "all" });
            gsap.set(flutesWrap, { autoAlpha: 0 }); // the video covers the screen by now
            vCard.dataset.final = "true";
            unlock();
            // StoryScroll picks it up from here and morphs the video into the About image on scroll
            html.dataset.intro = "done";
            window.dispatchEvent(new Event("hero:intro-complete"));
          };

          // 4. The video tile opens to full bleed; scroll is released as soon as it has, the copy keeps arriving
          const expand = () => {
            expandTl = gsap
              .timeline()
              .to(vCard, { scale: 1, clipPath: crop(W + OVERSCAN), duration: EXPAND_LEN, ease: "expo.inOut" }, 0)
              .call(finish, undefined, EXPAND_LEN)
              .to(scrimEl, { opacity: 1, duration: 0.9, ease: "power2.out" }, 0.65)
              .call(
                () => {
                  html.dataset.loading = "false"; // brings the nav in
                },
                undefined,
                0.85,
              )
              .to(lines, { yPercent: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" }, 0.75)
              .to(fades, { autoAlpha: 1, y: 0, duration: 0.95, stagger: 0.1, ease: "expo.out" }, 1.05)
              .to(draws, { scaleX: 1, duration: 1.2, ease: "expo.inOut" }, 1.3);
            if (skipped) expandTl.timeScale(3);
          };

          const count = { v: 0 };
          const setCount = () => {
            counterEl.textContent = String(Math.round(count.v)).padStart(3, "0");
          };
          const intro = gsap.timeline();

          // 0. The reeded wall: the upper flutes drop and the lower ones rise, centre first, to meet at the seam,
          // then one soft sheen runs across it left to right in step with the jumping tiles.
          // Only transform and opacity animate.
          const left = section.getBoundingClientRect().left;
          gsap.set(flutes, { scaleY: 0 });
          flutes.forEach((el, k) => {
            const r = el.getBoundingClientRect();
            const across = Math.min(1, Math.max(0, (r.left - left + r.width / 2) / W)); // 0 left edge, 1 right edge
            const fromCentre = Math.abs(across - 0.5) * 2; // 0 at the centre, 1 at the edges
            const lower = el.parentElement?.classList.contains("flute-row-b") ? 0.1 : 0;
            const glint = glints[k];
            intro.to(el, { scaleY: 1, duration: 0.9, ease: "expo.out" }, fromCentre * 0.4 + lower);
            const tWave = T_WAVE + across * ((TILES.length - 1) * STEP) + lower;
            intro
              .fromTo(glint, { opacity: 0 }, { opacity: 0.34, duration: 0.22, ease: "power2.out" }, tWave)
              .to(glint, { opacity: 0, duration: 0.55, ease: "power2.inOut" }, tWave + 0.22);
          });

          // 1. Row fades in, aligned
          intro.to(tiles, { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.04 }, 0);
          intro.fromTo(imgs, { scale: 1.3 }, { scale: 1, duration: 1, ease: "expo.out", stagger: 0.04 }, 0);
          intro.to(chrome, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "expo.out" }, 0.1);

          // 2. Loader wave: each tile leaps, lands, rebounds slightly; the counter advances with every leap
          tiles.forEach((el, i) => {
            const t = T_WAVE + i * STEP;
            intro
              .to(el, { y: -jump, duration: 0.24, ease: "power3.out" }, t)
              .to(el, { y: 0, duration: 0.2, ease: "power2.in" }, t + 0.24)
              .to(el, { y: -jump * 0.14, duration: 0.07, ease: "power2.out" }, t + 0.44)
              .to(el, { y: 0, duration: 0.07, ease: "power2.in" }, t + 0.51);
            intro.to(
              count,
              { v: ((i + 1) / TILES.length) * 100, duration: 0.25, ease: "power1.out", onUpdate: setCount },
              t,
            );
          });

          // 3. At 100 the row is straight; slide everything together, video on top (it has the highest z-index)
          intro.to(chrome, { autoAlpha: 0, y: -10, duration: 0.4, ease: "power2.in" }, T_CONVERGE);
          intro.to(
            tiles,
            { x: 0, duration: CONVERGE_LEN, ease: "expo.inOut", stagger: { each: 0.025, from: "edges" } },
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
            T_CONVERGE + CONVERGE_LEN + 0.12,
          );

          // Anyone who would rather not wait can skip: the button, Escape, a click, or any attempt to scroll
          const skip = () => {
            if (skipped || finished) return;
            skipped = true;
            intro.timeScale(5);
            expandTl?.timeScale(3);
            resolveReady();
          };
          skipIntro.current = skip;
          const passive = { passive: true, signal: gestures.signal } as const;
          window.addEventListener("wheel", skip, passive);
          window.addEventListener("touchmove", skip, passive);
          section.addEventListener("click", skip, { signal: gestures.signal });
          window.addEventListener(
            "keydown",
            (e) => {
              if (e.key === "Escape") skip();
            },
            { signal: gestures.signal },
          );

          return () => {
            killLate();
            unlock();
          };
        },
      );
    }, section);

    return () => {
      killLate();
      window.removeEventListener("motion:change", onMotion);
      ctx.revert();
      unlock();
      html.dataset.loading = "false";
      delete html.dataset.intro;
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
      {/* Loader backdrop: a reeded wall of flutes (see the CSS), two rows brick-offset so the seam reads like organ pipes */}
      <div aria-hidden className="hero-flutes">
        {["t", "b"].map((row) => (
          <div key={row} className={`flute-row flute-row-${row}`}>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} className="flute">
                <i />
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Loader counter, big, on the stone screen */}
      <span
        ref={counter}
        aria-hidden
        className="hero-chrome absolute bottom-5 left-5 font-display text-[clamp(5.5rem,17vw,16rem)] leading-[0.8] text-umber [font-variant-numeric:lining-nums_tabular-nums] md:bottom-8 md:left-[5vw]"
      >
        000
      </span>

      {/* The way out of the intro. It is a real button, so the keyboard reaches it; it leaves with the counter. */}
      <button
        type="button"
        onClick={() => skipIntro.current()}
        className="hero-chrome hero-skip absolute bottom-5 right-5 z-[8] md:bottom-8 md:right-[5vw]"
      >
        Skip intro
      </button>

      {/* Stage: the tile row (the last tile is the playing video). z-5 puts it above the About background and
          below the About text, so the video card can travel between them. */}
      <div aria-hidden className="absolute inset-0 isolate z-[5]">
        {TILES.map((tileItem, i) =>
          tileItem.kind === "video" ? (
            <div key="video" className="g-card absolute left-1/2 top-1/2" data-story="media">
              <video
                ref={video}
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* The About photo, centred at exactly the crop the About slot uses, so the hand-off is pixel-exact.
                  Same URL and same `sizes` as the slot, so the browser picks the same file for both. */}
              <div
                data-story="media-image"
                className="absolute left-1/2 top-0 h-full opacity-0"
                style={{ aspectRatio: String(ABOUT_IMAGE_ASPECT), transform: "translateX(-50%)" }}
              >
                <Image src={ABOUT_IMAGE} alt="" fill sizes={ABOUT_IMAGE_SIZES} className="object-cover" />
              </div>
              <div
                ref={scrim}
                data-story="scrim"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber/80 via-umber/20 to-umber/10"
              />
            </div>
          ) : (
            <div key={tileItem.id} className="g-card absolute left-1/2 top-1/2 overflow-hidden" data-index={i}>
              <div className="g-img absolute inset-0">
                <Image
                  src={unsplash(tileItem.id, [1, 1])}
                  alt=""
                  fill
                  priority
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            </div>
          ),
        )}
      </div>

      {/* Hero copy */}
      <div data-story="hero-copy" className="absolute inset-0 z-10">
        <div className="absolute inset-x-0 bottom-0 px-5 pb-[7dvh] md:px-[5vw] md:pb-[8dvh]">
          <div className="grid items-end gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-10">
            <h1
              id="hero-title"
              className="font-display text-[clamp(2.9rem,7.6vw,9rem)] font-normal leading-[0.95] text-plaster"
            >
              <span className="hero-line -mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="block">Rooms composed</span>
              </span>
              <span className="hero-line -mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="block">to be lived in.</span>
              </span>
            </h1>

            {/* A quiet editorial block: one line of proof, one reason to act, one typographic call to action */}
            <div className="md:pb-[0.4em]">
              <p className="hero-fade max-w-[34ch] text-balance text-[15px] leading-relaxed text-plaster/85 md:text-base">
                Eighteen years designing private residences in London, from first sketch to final handover.
                Taking on four new homes for 2027.
              </p>
              <a
                href="#contact"
                className="group mt-8 block focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-plaster md:mt-10"
              >
                <span className="hero-fade flex items-end justify-between gap-6">
                  <span className="font-display text-[clamp(1.55rem,2.15vw,2.3rem)] leading-none text-plaster">
                    Book a consultation
                  </span>
                  <ArrowRight
                    size={22}
                    weight="light"
                    aria-hidden
                    className="mb-[0.1em] shrink-0 text-plaster transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
                  />
                </span>
                <span className="hero-fade relative mt-5 block h-px">
                  <span aria-hidden className="hero-draw absolute inset-0 bg-plaster/35" />
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-left scale-x-0 bg-plaster transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
