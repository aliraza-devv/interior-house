import Image from "next/image";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { ABOUT_IMAGE, ABOUT_IMAGE_ALT } from "@/lib/media";

const HEADING = ["The", "Studio"] as const;

const COPY =
  "Hallam & Wren is a London interior studio led by architects and designers. We take every home from first sketch to final handover, with one team accountable for the design, the budget and the build.";

// Placeholder figures. Replace with the studio's real numbers. 140 and 18 match the hero line.
const STATS = [
  { to: 18, suffix: "", label: "Years in practice" },
  { to: 140, suffix: "", label: "Homes completed" },
  { to: 71, suffix: "%", label: "Clients who return or refer" },
] as const;

/**
 * About. Static markup only: StoryScroll (client) adds the motion and morphs the hero video into the image slot.
 *
 * Layering (z): background 0, content 2, hero video card 5 (lives in the hero stage). The video travels OVER
 * the text and uncovers it as it shrinks, so the text is revealed rather than ghosting over footage.
 * Desktop uses a 12-column grid on the same 5vw margins as the nav and hero: image spans columns 1-4,
 * copy starts at column 6. Colours are the fixed stone and umber, so the section looks the same in both
 * colour schemes. Without JavaScript or with reduced motion everything is simply visible.
 */
export function About() {
  return (
    <section
      id="studio"
      aria-labelledby="studio-title"
      className="relative px-5 pb-[16dvh] pt-[14dvh] md:px-[5vw]"
    >
      <div aria-hidden className="absolute inset-0 z-0 bg-stone" />

      <div className="relative z-[2]">
        <h2
          id="studio-title"
          aria-label={HEADING.join(" ")}
          data-story="heading"
          className="font-display text-[clamp(4rem,15vw,15rem)] font-normal leading-[0.9] tracking-[-0.02em] text-umber md:text-[clamp(5rem,12.5vw,15rem)]"
        >
          {HEADING.map((word, wi) => (
            <span key={word} aria-hidden className="inline-block whitespace-nowrap">
              {word.split("").map((ch, ci) => (
                <span
                  key={ci}
                  className="-mb-[0.15em] -mt-[0.1em] inline-block overflow-hidden pb-[0.15em] pt-[0.1em] align-top"
                >
                  <span data-story="char" className="inline-block">
                    {ch}
                  </span>
                </span>
              ))}
              {wi < HEADING.length - 1 ? <span className="inline-block w-[0.28em]" /> : null}
            </span>
          ))}
        </h2>

        <div className="mt-[5dvh] grid gap-10 md:grid-cols-12 md:gap-x-0">
          {/* The hero video lands here, then this real image takes over at the same pixels */}
          <div data-story="slot" className="relative aspect-square w-full overflow-hidden md:col-span-4">
            <div data-story="slot-image" className="absolute inset-0">
              <Image
                src={ABOUT_IMAGE}
                alt={ABOUT_IMAGE_ALT}
                fill
                unoptimized
                sizes="(min-width: 768px) 30vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Copy sits at the image's top edge, the figures sit on its bottom edge */}
          <div className="flex flex-col justify-between gap-14 md:col-span-6 md:col-start-6 md:max-w-[40rem]">
            <div>
              <p className="-mt-[0.22em] text-[clamp(1.25rem,1.85vw,1.85rem)] leading-[1.38] tracking-[-0.01em] text-umber">
                {COPY.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className="-mb-[0.14em] mr-[0.26em] inline-block overflow-hidden pb-[0.14em] align-top"
                  >
                    <span data-story="word" className="inline-block">
                      {word}
                    </span>
                  </span>
                ))}
              </p>
              <div className="mt-8">
                <MagneticLink href="#approach" variant="quiet-stone">
                  Our approach
                </MagneticLink>
              </div>
            </div>

            <div>
              <div aria-hidden data-story="rule" className="h-px origin-left bg-umber/30" />
              <dl className="mt-7 grid grid-cols-3 gap-4 md:gap-8">
                {STATS.map((s) => (
                  <div key={s.label} data-story="stat" className="flex flex-col">
                    <dt className="mt-3 text-[13px] leading-snug text-umber/80 md:text-sm">{s.label}</dt>
                    <dd
                      data-story="count"
                      data-to={s.to}
                      data-suffix={s.suffix}
                      className="order-first font-display text-[clamp(3rem,6.2vw,6.5rem)] leading-[0.9] text-umber [font-variant-numeric:lining-nums_tabular-nums]"
                    >
                      {s.to}
                      {s.suffix}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
