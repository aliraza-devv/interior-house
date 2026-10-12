"use client";

import { ArrowLeft, ArrowRight, Star } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { PHOTOS, unsplash } from "@/lib/photos";

const photo = (id: string) => unsplash(id, [1, 1]);

type Tone = "bone" | "linen" | "stone" | "raised";

// Placeholder client voices and photographs. Replace with real, permissioned ones.
// `parts` is the quote split into plain text and highlighted phrases (true = highlighted).
const ITEMS: readonly {
  project: string;
  name: string;
  fact: string;
  tone: Tone;
  photo: string;
  parts: readonly (readonly [string, boolean])[];
}[] = [
  {
    project: "Highgate House",
    name: "Mrs Hartley",
    fact: "Handed over 11 days early",
    tone: "bone",
    photo: PHOTOS.highgate.id,
    parts: [
      ["Every morning it still feels like the first day. ", false],
      ["Nothing in this house is an accident.", true],
    ],
  },
  {
    project: "Kew Green House",
    name: "The Okonkwo-Reids",
    fact: "Within 2% of the agreed budget",
    tone: "linen",
    photo: PHOTOS.kew.id,
    parts: [
      ["They asked how we cook, then ", false],
      ["built the kitchen around it", true],
      [". We have changed nothing since.", false],
    ],
  },
  {
    project: "Cadogan Flat",
    name: "Madeleine Delacroix",
    fact: "Finished in 31 weeks, as quoted",
    tone: "stone",
    photo: PHOTOS.cadogan.id,
    parts: [
      ["I gave them a tight flat and a loose brief. ", false],
      ["It now feels twice the size.", true],
    ],
  },
  {
    project: "Wren Cottage",
    name: "Mr Sinclair",
    fact: "One lead, from first sketch to handover",
    tone: "raised",
    photo: PHOTOS.wren.id,
    parts: [
      ["Forty tradespeople, ", false],
      ["one point of contact", true],
      [". I never once had to chase anyone.", false],
    ],
  },
  {
    project: "Marlow Barn",
    name: "Mr Ashworth",
    fact: "Fully fitted six days before move-in",
    tone: "bone",
    photo: PHOTOS.marlow.id,
    parts: [
      ["Six weeks in, I stopped asking for updates. ", false],
      ["I never needed one.", true],
    ],
  },
];

/**
 * A fanned stack of client testimonials: the current card in front, its neighbours tilted behind it and fading
 * toward the edges. Arrows, dots, the arrow keys and a swipe all move it. Each card's position is set from one
 * number (its distance from the current card) and CSS transitions do the rest, so everything is interruptible and
 * runs on transform and opacity only. Each card carries the project, five stars, the quote with its key phrase
 * highlighted, the client's name, one concrete fact, and a thumbnail of their home. Colours are the site's own.
 */
export function Testimonials() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLElement>(null);
  const startX = useRef<number | null>(null);
  const last = ITEMS.length - 1;

  // Fan the cards out once, when the section first scrolls into view
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (to: number) => setActive(Math.min(last, Math.max(0, to)));

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowLeft") go(active - 1);
    if (e.key === "ArrowRight") go(active + 1);
  };

  // Swipe: a horizontal drag of more than 48px moves one card
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 48) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      ref={root}
      id="clients"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onKeyDown={onKeyDown}
      className="tc"
    >
      <div className="tc-head">
        <div>
          <p className="tc-eyebrow">A few words from our clients</p>
          <h2 className="tc-title font-display">Homes that get people talking.</h2>
        </div>

        <div className="tc-arrows">
          <button
            type="button"
            className="tc-btn"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Previous testimonial"
          >
            <ArrowLeft size={18} weight="regular" aria-hidden />
          </button>
          <button
            type="button"
            className="tc-btn"
            onClick={() => go(active + 1)}
            disabled={active === last}
            aria-label="Next testimonial"
          >
            <ArrowRight size={18} weight="regular" aria-hidden />
          </button>
        </div>
      </div>

      <div
        className="tc-stage"
        data-in={inView}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
      >
        {ITEMS.map((it, i) => {
          const d = i - active; // distance from the current card: negative is to the left
          const ad = Math.abs(d);
          const style = {
            "--d": d,
            "--ad": ad,
            "--o": ad <= 1 ? 1 : ad === 2 ? 0.45 : 0,
            zIndex: 10 - ad,
          } as CSSProperties;
          return (
            <article
              key={it.name}
              className="tc-card"
              data-tone={it.tone}
              data-active={d === 0}
              style={style}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${ITEMS.length}`}
              aria-hidden={d !== 0}
            >
              <header className="tc-card-top">
                <span className="tc-project">{it.project}</span>
                <span className="tc-stars">
                  <span className="sr-only">Rated 5 out of 5</span>
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star key={s} size={13} weight="fill" aria-hidden />
                  ))}
                </span>
              </header>

              <blockquote className="tc-quote font-display">
                <p>
                  {it.parts.map(([text, hl], k) =>
                    hl ? (
                      <mark key={k} className="tc-mark">
                        {text}
                      </mark>
                    ) : (
                      <span key={k}>{text}</span>
                    ),
                  )}
                </p>
              </blockquote>

              <footer className="tc-by">
                <span className="tc-avatar">
                  <Image src={photo(it.photo)} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="tc-who">
                  <cite className="tc-name">{it.name}</cite>
                  <span className="tc-fact">{it.fact}</span>
                </span>
              </footer>
            </article>
          );
        })}
      </div>

      <div className="tc-foot">
        <p className="tc-count" aria-live="polite">
          {String(active + 1).padStart(2, "0")} / {String(ITEMS.length).padStart(2, "0")}
        </p>
        <div className="tc-dots">
          {ITEMS.map((it, i) => (
            <button
              key={it.name}
              type="button"
              className="tc-dot"
              data-on={i === active}
              onClick={() => go(i)}
              aria-label={`Show testimonial ${i + 1}, ${it.name}`}
              aria-current={i === active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
