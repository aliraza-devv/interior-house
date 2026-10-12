"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { PHOTOS, unsplash } from "@/lib/photos";

// Placeholder questions, answers and photograph. Replace with the studio's own.
const PHOTO = unsplash(PHOTOS.calm.id, [4, 5]);
const PHOTO_ALT = PHOTOS.calm.alt;

const QA = [
  {
    q: "Do you design only, or manage the build too?",
    a: "Both, as one team. You can commission the design alone, but most clients choose us for the whole project, so the person who drew the room is the person checking it on site.",
  },
  {
    q: "What does the design stage include?",
    a: "Measured plans, a full material and lighting scheme, bespoke joinery drawings and a fixed-price build estimate. It takes about twelve weeks, and you see every decision on one board before anything is ordered.",
  },
  {
    q: "How much does a project cost?",
    a: "Full-home projects typically begin around £300,000, excluding furniture. After our first conversation we quote a fixed design fee, and the build is priced line by line.",
  },
  {
    q: "How long does it take?",
    a: "The design stage takes about twelve weeks. The renovation then runs from six to nine months, depending on the structure. You have a dated programme before you commit.",
  },
  {
    q: "What happens if the budget changes?",
    a: "Every change is priced, explained and agreed in writing before work starts. Nothing is added to your invoice that you have not already approved.",
  },
  {
    q: "Do you work outside London?",
    a: "Yes. We take on a small number of homes across the UK each year, and we work remotely with clients abroad, with a site lead on every project.",
  },
  {
    q: "How do we begin?",
    a: "Book a consultation. We talk about the house and how you live in it for about thirty minutes, then send a clear proposal within a week.",
  },
] as const;

/**
 * Questions, set the way an editorial page would set them: the heading and a quiet photograph on the left (they stay
 * in view as you read), and on the right a plain list of questions in the display face, separated by hairlines. Choosing
 * a question opens its answer beneath it, one at a time, with a thin plus that turns. Nothing else. The photograph
 * rises into its frame in one quiet wipe.
 *
 * Standard disclosure pattern: each question is a button (aria-expanded) controlling a region; the arrow keys, Home
 * and End move between the questions. Reduced motion shows the photograph at once and shortens every transition.
 */
export function Faq() {
  const base = useId();
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(0);
  const [inView, setInView] = useState(false);

  // The rows rise in once, when the list first scrolls into view
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The photograph rises into its frame in one quiet wipe, once
  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const photo = section.querySelector<HTMLElement>(".faq-photo");
        const img = section.querySelector<HTMLElement>(".faq-photo-img");
        if (!photo || !img) return;

        gsap.set(photo, { autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: section,
          start: "top 62%",
          once: true,
          onEnter: () => {
            gsap
              .timeline()
              .fromTo(
                photo,
                { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: 1.4,
                  ease: "expo.out",
                  onComplete: () => {
                    photo.style.clipPath = "none";
                  },
                },
                0,
              )
              .fromTo(img, { scale: 1.06 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0);
          },
        });

        return () => {
          photo.style.clipPath = "";
          img.style.transform = "";
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const current = buttons.current.findIndex((b) => b === document.activeElement);
    if (current < 0) return;
    e.preventDefault();
    const last = QA.length - 1;
    const to =
      e.key === "Home" ? 0 : e.key === "End" ? last : Math.min(last, Math.max(0, current + (e.key === "ArrowDown" ? 1 : -1)));
    buttons.current[to]?.focus();
  };

  return (
    <section ref={root} id="faq" aria-labelledby="faq-title" className="faq">
      <div className="faq-grid">
        <div className="faq-aside">
          <h2 id="faq-title" className="faq-title font-display">
            Questions
          </h2>
          <p className="faq-lede">Still wondering? Write to us and a person, not a form, will reply.</p>
          <MagneticLink href="mailto:hello@hallamwren.com" variant="quiet-stone">
            Ask us directly
          </MagneticLink>

          <div className="faq-photo">
            <div className="faq-photo-img">
              <Image
                src={PHOTO}
                alt={PHOTO_ALT}
                fill
                sizes="(min-width: 900px) 24rem, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <ul ref={list} className="faq-list" data-in={inView} onKeyDown={onKeyDown}>
          {QA.map((item, i) => {
            const isOpen = open === i;
            const bid = `${base}-b${i}`;
            const pid = `${base}-p${i}`;
            return (
              <li key={item.q} className="faq-item" data-open={isOpen} style={{ "--i": i } as CSSProperties}>
                <h3 className="faq-q">
                  <button
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    type="button"
                    id={bid}
                    className="faq-btn"
                    aria-expanded={isOpen}
                    aria-controls={pid}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="faq-qtext font-display">{item.q}</span>
                    <span aria-hidden className="faq-plus">
                      <i />
                      <i />
                    </span>
                  </button>
                </h3>
                <div id={pid} role="region" aria-labelledby={bid} className="faq-panel" inert={!isOpen}>
                  <div className="faq-panel-in">
                    <p>{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
