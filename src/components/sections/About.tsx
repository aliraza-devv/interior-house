import Image from "next/image";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { ABOUT_CAPTION, ABOUT_IMAGE, ABOUT_IMAGE_ALT, ABOUT_IMAGE_SIZES } from "@/lib/media";
import { unsplash } from "@/lib/photos";

const HEADING = ["The", "Studio"] as const;

// PLACEHOLDER copy. It says who the studio is and how it works. "First sketch to final handover" is left to the hero
// and "how a project runs" to the Process section, so no line is said twice on the page.
const STATEMENT =
  "Architects and interior designers in Hampstead. We take on seven or eight London homes a year, mostly Georgian and Victorian, and build each from our own drawings with trades we have known for years.";
const SUPPORT =
  "Most of our clients come to us through someone whose home we have already finished, and many come back for the next one.";

// PLACEHOLDER figures. Replace with the studio's real numbers. Each carries an anchor (where, since when, or on what
// basis), because a bare number asks to be taken on trust. 18 years and 140 homes match the hero line.
const STATS = [
  { to: 18, suffix: "", label: "Years in practice", note: "Hampstead, since 2008" },
  { to: 140, suffix: "", label: "Homes completed", note: "London and the Home Counties" },
  { to: 71, suffix: "%", label: "Clients who return or refer", note: "Every client since 2015" },
] as const;

// PLACEHOLDER people: invented names, roles and stock portraits. Replace with the studio's real leads and real photographs
// (a portrait is optional; remove the `photo` field and the name and role stand alone).
const PEOPLE = [
  { name: "Eleanor Hallam", role: "Design director", photo: "1580489944761-15a19d654956" },
  { name: "Thomas Wren", role: "Founding principal, architect", photo: "1472099645785-5658abf4ff4e" },
] as const;
const portrait = (id: string) => unsplash(id, [4, 5]);

// PLACEHOLDER recognition: every name here is INVENTED. Replace with press, awards and memberships the studio really
// holds, and delete the rest. Never publish invented press or awards: it misleads clients and can breach advertising law.
const RECOGNITION = [
  {
    label: "Featured in",
    items: [
      { name: "The Dwelling Quarterly", note: "2024" },
      { name: "Journal of Interiors", note: "2023" },
    ],
  },
  {
    label: "Recognised by",
    items: [
      { name: "Residential Design Prize", note: "Shortlisted, 2024" },
      { name: "Heritage Interiors Award", note: "Winner, 2022" },
    ],
  },
  {
    label: "Member of",
    items: [{ name: "Institute of Residential Designers", note: "Since 2012" }],
  },
] as const;

// Small uppercase labels, all at the site's one label strength (see --text-3 in globals.css); only size and spacing differ
const LABEL_BASE = "font-medium uppercase text-[color:var(--text-3)]";
const LABEL = `${LABEL_BASE} text-xs tracking-[0.2em]`;
const LABEL_TIGHT = `${LABEL_BASE} text-xs tracking-[0.16em]`;
const NOTE = `${LABEL_BASE} text-xs tracking-[0.14em]`;

/**
 * About. Static markup only: StoryScroll (client) adds the motion and morphs the hero video into the photograph.
 *
 * Top to bottom: the title; then a photograph of the studio at work (a hand drawing a house), captioned, with a way into the work,
 * beside a short statement of who the studio is, a line on how its clients find it, and three figures that each say
 * what they measure; then, under one hairline, the people who lead the studio and the recognition it holds, set as
 * quiet typography (no logos, no badges).
 *
 * Layering (z): background 0, content 2, hero video card 5 (lives in the hero stage). The video travels OVER
 * the text and uncovers it as it shrinks, so the text is revealed rather than ghosting over footage.
 * Desktop uses a 12-column grid on the same 5vw margins as the nav and hero: the photograph spans columns 1-4, the
 * copy starts at column 6, and the people and recognition below start on the same two columns. Colours are the fixed
 * stone and umber, so the section looks the same in both colour schemes. Without JavaScript or with reduced motion
 * everything is simply visible.
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
          className="font-display text-[clamp(4rem,15vw,15rem)] font-normal leading-[0.9] text-umber md:text-[clamp(5rem,min(12.5vw,24dvh),15rem)]"
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

        {/* The room reserved under the photograph on desktop (md:mb-20) is where its caption hangs */}
        <div className="mt-[5dvh] grid gap-10 md:mb-20 md:grid-cols-12 md:gap-x-0">
          {/* The hero video lands in this frame, then the real photograph takes over at the same pixels */}
          {/* On desktop the frame is as tall as the copy beside it (so the figures sit on its bottom edge), but never
              taller than 1.25 times its width or 58% of the screen, so the section always fits one view. */}
          <div className="[container-type:inline-size] md:col-span-4">
            <figure className="relative m-0 md:h-full md:max-h-[min(125cqw,58dvh)]">
              <div
                data-story="slot"
                className="relative aspect-[4/5] w-full overflow-hidden md:absolute md:inset-0 md:aspect-auto"
              >
                <div data-story="slot-image" className="absolute inset-0">
                  <Image
                    src={ABOUT_IMAGE}
                    alt={ABOUT_IMAGE_ALT}
                    fill
                    sizes={ABOUT_IMAGE_SIZES}
                    className="object-cover"
                  />
                </div>
              </div>
              {/* A museum label: which project this is, and the way into the rest of the work */}
              <figcaption
                data-story="fade"
                className="mt-4 flex items-start justify-between gap-6 md:absolute md:inset-x-0 md:top-full"
              >
                <span className="block">
                  <span className="block font-display text-[1.3rem] leading-none text-umber">{ABOUT_CAPTION.title}</span>
                  <span className={`mt-2 block ${LABEL}`}>{ABOUT_CAPTION.meta}</span>
                </span>
                <MagneticLink href="#projects" variant="quiet-stone">
                  View the work
                </MagneticLink>
              </figcaption>
            </figure>
          </div>

          {/* Copy sits at the photograph's top edge, the figures sit on its bottom edge */}
          <div className="flex flex-col justify-between gap-14 md:col-span-6 md:col-start-6">
            <div>
              <p className="-mt-[0.22em] text-[clamp(1.25rem,1.85vw,1.85rem)] leading-[1.38] tracking-[-0.01em] text-umber md:max-w-[40rem]">
                {STATEMENT.split(" ").map((word, i) => (
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
              <p
                data-story="fade"
                className="mt-6 max-w-[30rem] text-[15px] leading-relaxed text-[color:var(--text-2)] md:text-base"
              >
                {SUPPORT}
              </p>
              <div data-story="fade" className="mt-8">
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
                    <dt className="mt-3 text-[13px] leading-snug text-[color:var(--text-2)] md:text-sm">
                      {s.label}
                      <span className={`mt-1.5 block ${NOTE}`}>{s.note}</span>
                    </dt>
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

        {/* Who leads the studio, and what it is recognised for: two columns on the same columns as the grid above */}
        <div className="mt-20 md:mt-[6dvh]">
          <div aria-hidden data-story="fade" className="h-px bg-umber/30" />
          <div className="grid gap-14 pt-10 md:grid-cols-12 md:gap-x-0 md:pt-12">
            <div data-story="fade" className="md:col-span-4">
              <h3 className={`m-0 ${LABEL}`}>Led by</h3>
              <ul className="m-0 mt-6 list-none divide-y divide-umber/30 p-0">
                {PEOPLE.map((p) => (
                  <li key={p.name} className="flex items-center gap-5 py-5 first:pt-0 last:pb-0">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[color:var(--bone)]">
                      <Image
                        src={portrait(p.photo)}
                        alt={`Portrait of ${p.name}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="m-0 font-display text-[clamp(1.5rem,1.9vw,1.9rem)] leading-none text-umber">
                        {p.name}
                      </p>
                      <p className={`m-0 mt-2 ${LABEL_TIGHT}`}>{p.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div data-story="fade" className="md:col-span-6 md:col-start-6">
              <h3 className={`m-0 ${LABEL}`}>Recognition</h3>
              <dl className="m-0 mt-6 divide-y divide-umber/30">
                {RECOGNITION.map((g) => (
                  <div
                    key={g.label}
                    className="grid gap-2 py-5 first:pt-0 last:pb-0 lg:grid-cols-[9.5rem_1fr] lg:gap-6"
                  >
                    <dt className={`m-0 lg:pt-[0.35em] ${LABEL_TIGHT}`}>{g.label}</dt>
                    <dd className="m-0 grid gap-1.5">
                      {g.items.map((it) => (
                        <span key={it.name} className="flex flex-wrap items-baseline gap-x-3">
                          <span className="font-display text-[clamp(1.2rem,1.45vw,1.45rem)] leading-tight text-umber">
                            {it.name}
                          </span>
                          <span className={NOTE}>{it.note}</span>
                        </span>
                      ))}
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
