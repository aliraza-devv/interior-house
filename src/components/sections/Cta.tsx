"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { PHOTOS, unsplash } from "@/lib/photos";

// Placeholder contact address and photograph. Replace with the studio's own.
const EMAIL = "hello@hallamwren.com";
const PHOTO = unsplash(PHOTOS.kew.id, [4, 5]);
const PHOTO_ALT = PHOTOS.kew.alt;

/**
 * The final call to action, as the first sheet of your project. A plaster drawing sheet with a faint drawing grid,
 * a double border and a dimension string across the top. On the left the headline, one line of reassurance and one
 * button; on the right a finished room, framed like a print on the sheet, which shows what the conversation leads to.
 * It continues the drawing language of the Draw step. (Contact details live in the footer, so they are not repeated.)
 *
 * On first scroll into view the dimension string draws, the headline rises out of its masks, the photograph rises
 * into its frame in one quiet wipe and the rest arrives. Reduced motion shows it all at once.
 */
export function Cta() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const dim = section.querySelector<HTMLElement>(".cta-dim-line");
        const lines = gsap.utils.toArray<HTMLElement>(".cta-line > span", section);
        const fades = gsap.utils.toArray<HTMLElement>(".cta-fade", section);
        const mat = section.querySelector<HTMLElement>(".cta-mat");
        const photo = section.querySelector<HTMLElement>(".cta-photo");
        const img = section.querySelector<HTMLElement>(".cta-photo-img");
        if (!dim || !mat || !photo || !img) return;

        // Hidden states (the section is below the fold, so there is no flash)
        gsap.set(dim, { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(lines, { yPercent: 115 });
        gsap.set(fades, { autoAlpha: 0, y: 22 });
        gsap.set(mat, { autoAlpha: 0, y: 22 });
        gsap.set(photo, { autoAlpha: 0 });

        ScrollTrigger.create({
          trigger: section,
          start: "top 62%",
          once: true,
          onEnter: () => {
            gsap
              .timeline()
              .to(dim, { scaleX: 1, duration: 1.6, ease: "expo.inOut" }, 0)
              .to(lines, { yPercent: 0, duration: 1.5, stagger: 0.12, ease: "expo.out" }, 0.25)
              .to(fades, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.12, ease: "expo.out" }, 0.85)
              .to(mat, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, 0.35)
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
                0.8,
              )
              .fromTo(img, { scale: 1.06 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0.8);
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

  return (
    <section ref={root} id="contact" aria-labelledby="cta-title" className="cta">
      <div className="cta-sheet">
        {/* A dimension string across the top, as on a drawing */}
        <div aria-hidden className="cta-dim">
          <span className="cta-dim-line" />
          <span className="cta-dim-tick cta-dim-tick-l" />
          <span className="cta-dim-tick cta-dim-tick-r" />
          <span className="cta-dim-label">
            <span className="cta-dim-long">First call to handover: about nine months</span>
            <span className="cta-dim-short">About nine months</span>
          </span>
        </div>

        <div className="cta-main">
          <div className="cta-copy">
            <h2 id="cta-title" className="cta-title font-display">
              <span className="cta-line">
                <span>Let&rsquo;s draw</span>
              </span>
              <span className="cta-line">
                <span>your home.</span>
              </span>
            </h2>
            <p className="cta-lede cta-fade">
              Tell us about the house. We reply within two working days with a time to talk.
            </p>
            <div className="cta-actions cta-fade">
              <MagneticLink href={`mailto:${EMAIL}?subject=Consultation%20enquiry`} variant="stone">
                Book a consultation
              </MagneticLink>
            </div>
          </div>

          <figure className="cta-figure">
            <div className="cta-mat">
              <div className="cta-photo">
                <div className="cta-photo-img">
                  <Image
                    src={PHOTO}
                    alt={PHOTO_ALT}
                    fill
                    sizes="(min-width: 900px) 30vw, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <figcaption className="cta-cap cta-fade">Kew Green House, Richmond, 2022</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
