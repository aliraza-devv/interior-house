"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { motionPaused } from "@/lib/motion";

// Must match the overscan on the hero video, so the hand-over from hero to this layer is invisible
const OVERSCAN = 4;

const q = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);
const all = <T extends HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector);

/**
 * The hero video and the About image are ONE element for the length of the transition.
 *
 * After the loader, the video card becomes a fixed layer (full viewport). While the user scrolls the first
 * screen, the card is interpolated from "full viewport" to the live rectangle of the About image slot,
 * measured every frame, so it lands exactly where that image sits even though the page is still moving.
 * Shrinking is a UNIFORM scale plus a clip, so the video is never stretched. Late in the move the video
 * cross-fades to the photo, and at the end the real slot image takes over at the same pixels.
 *
 * Text reveals are separate, time-based, play-once triggers, so they feel the same at any scroll speed.
 * Reduced motion: nothing here runs and the page is simply static.
 */
function setup(): (() => void) | undefined {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const hero = q<HTMLElement>("#top");
  const media = q<HTMLElement>('[data-story="media"]');
  const mediaImg = q<HTMLElement>('[data-story="media-image"]');
  const scrim = q<HTMLElement>('[data-story="scrim"]');
  const heroCopy = q<HTMLElement>('[data-story="hero-copy"]');
  const slot = q<HTMLElement>('[data-story="slot"]');
  const slotImg = q<HTMLElement>('[data-story="slot-image"]');
  const heading = q<HTMLElement>('[data-story="heading"]');
  const rule = q<HTMLElement>('[data-story="rule"]');
  const video = media?.querySelector("video") ?? null;
  if (!hero || !media || !mediaImg || !scrim || !heroCopy || !slot || !slotImg || !heading || !rule || !video) {
    return;
  }

  const chars = all<HTMLElement>('[data-story="char"]');
  const words = all<HTMLElement>('[data-story="word"]');
  const stats = all<HTMLElement>('[data-story="stat"]');
  const counts = all<HTMLElement>('[data-story="count"]');
  const fades = all<HTMLElement>('[data-story="fade"]'); // caption, supporting line, people, recognition
  const paragraph = words[0]?.closest("p") ?? null;

  const ease = gsap.parseEase("power2.inOut");
  let W = 0; // viewport width (without scrollbar)
  let H = 0; // viewport height
  let Wm = 0; // unscaled card width: wide enough to be cropped to the slot's shape
  let handed = false;

  const measure = () => {
    W = document.documentElement.clientWidth;
    H = window.innerHeight;
    const r = slot.getBoundingClientRect();
    Wm = Math.max(W + OVERSCAN, H * (r.width / Math.max(r.height, 1)));
    gsap.set(media, { position: "fixed", left: "50%", top: "50%", width: Wm, height: H, xPercent: -50, yPercent: -50 });
  };

  // Where the slot sits on screen when the morph has finished: the heading rests 14% down the viewport
  // (clear of the nav) and the slot sits below it. Rect differences are scroll-invariant.
  const settleTop = () =>
    slot.getBoundingClientRect().top - heading.getBoundingClientRect().top + 0.14 * window.innerHeight;
  const distance = () => {
    const docTop = slot.getBoundingClientRect().top + window.scrollY;
    // Never ask for more scroll than the page has, or the morph could not finish and the hand-off would not fire
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight - 1;
    return Math.max(240, Math.min(docTop - settleTop(), maxScroll));
  };

  const apply = (raw: number) => {
    const e = ease(raw);
    const r = slot.getBoundingClientRect(); // live rectangle, so the card tracks the scrolling page
    const fullL = -OVERSCAN / 2; // full bleed, with a hair of overscan each side
    const fullR = W + OVERSCAN / 2;
    const L = fullL + (r.left - fullL) * e;
    const T = r.top * e;
    const R = fullR + (r.right - fullR) * e;
    const B = H + (r.bottom - H) * e;
    const w = Math.max(R - L, 1);
    const h = Math.max(B - T, 1);
    const s = h / H; // uniform scale, fitted by height
    const inset = Math.max(0, (Wm - w / s) / 2); // crop the sides to the card's current shape
    gsap.set(media, {
      x: (L + R) / 2 - W / 2,
      y: (T + B) / 2 - H / 2,
      scale: s,
      clipPath: `inset(0px ${inset}px 0px ${inset}px)`,
    });

    // At the end the real image in the slot takes over, pixel for pixel
    const done = e > 0.998; // within about a pixel of the slot
    if (done !== handed) {
      handed = done;
      media.style.visibility = done ? "hidden" : "visible";
      slotImg.style.opacity = done ? "1" : "0";
      if (done) video.pause();
      else if (!motionPaused()) void video.play().catch(() => {});
    }
  };

  const proxy = { p: 0 };
  const onLoad = () => ScrollTrigger.refresh();
  const onRefreshInit = () => {
    measure();
    apply(proxy.p);
  };

  const ctx = gsap.context(() => {
    media.dataset.final = "bridge";
    measure();
    gsap.set(slotImg, { opacity: 0 });

    // Hidden states for the About copy (it is below the fold, so there is no flash)
    gsap.set(chars, { yPercent: 115 });
    gsap.set(words, { yPercent: 110 });
    gsap.set(rule, { scaleX: 0 });
    gsap.set(stats, { autoAlpha: 0, y: 28 });
    gsap.set(fades, { opacity: 0, y: 22 }); // opacity only: the links inside stay reachable by keyboard
    counts.forEach((el) => {
      el.textContent = `0${el.dataset.suffix ?? ""}`;
    });

    apply(0);

    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      .to(proxy, { p: 1, duration: 1, onUpdate: () => apply(proxy.p) }, 0)
      .to(scrim, { opacity: 0, duration: 0.55 }, 0.15) // the legibility gradient leaves as the video shrinks
      .to(mediaImg, { autoAlpha: 1, duration: 0.35 }, 0.58) // video becomes the photograph
      .to(heroCopy, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0)
      // Heading: letters rise out of their masks, driven by the scroll itself. The video is still uncovering the
      // heading while this plays, so each letter surfaces as the footage slides away from it, at any scroll speed.
      .fromTo(
        chars,
        { yPercent: 115 },
        { yPercent: 0, ease: "power3.out", duration: 0.3, stagger: 0.024 },
        0.4,
      );

    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    // Fonts and images can shift the layout after setup, which would leave the end point stale
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", onLoad, { once: true });

    // Paragraph: words rise out of masks
    if (paragraph) {
      ScrollTrigger.create({
        trigger: paragraph,
        start: "top 72%",
        once: true,
        onEnter: () => {
          gsap.to(words, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.016 });
        },
      });
    }

    // The quieter blocks (photograph caption, supporting line, people, recognition) simply rise in as they arrive,
    // those that arrive together one after another
    ScrollTrigger.batch(fades, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.1 });
      },
    });

    // Stats: hairline draws, figures rise and count up
    ScrollTrigger.create({
      trigger: rule,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(rule, { scaleX: 1, duration: 1.6, ease: "expo.inOut" });
        gsap.to(stats, { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.12, delay: 0.15 });
        counts.forEach((el, i) => {
          const to = Number(el.dataset.to ?? 0);
          const suffix = el.dataset.suffix ?? "";
          const o = { v: 0 };
          gsap.to(o, {
            v: to,
            duration: 2.2,
            ease: "expo.out",
            delay: 0.15 + i * 0.12,
            onUpdate: () => {
              el.textContent = `${Math.round(o.v)}${suffix}`;
            },
          });
        });
      },
    });
  });

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
    window.removeEventListener("load", onLoad);
    ctx.revert();
    gsap.set(media, { clearProps: "all" });
    media.style.visibility = "";
    media.dataset.final = "true";
    slotImg.style.opacity = "";
    counts.forEach((el) => {
      el.textContent = `${el.dataset.to ?? ""}${el.dataset.suffix ?? ""}`;
    });
    if (!motionPaused()) void video.play().catch(() => {});
  };
}

/** Waits for the hero loader to finish, then wires the hero video into the About section. Renders nothing. */
export function StoryScroll() {
  useEffect(() => {
    let teardown: (() => void) | undefined;
    const start = () => {
      teardown = setup();
      ScrollTrigger.refresh();
    };

    if (document.documentElement.dataset.intro === "done") start();
    else window.addEventListener("hero:intro-complete", start, { once: true });

    return () => {
      window.removeEventListener("hero:intro-complete", start);
      teardown?.();
    };
  }, []);

  return null;
}
