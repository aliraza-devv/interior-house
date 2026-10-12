import { ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  /** plaster over imagery, umber on the stone background. Fixed colours, so it is identical in both colour schemes. */
  tone?: "plaster" | "umber";
};

/**
 * A typographic call to action: display-serif label resting on a hairline, with an arrow. No button shape.
 * On hover the hairline fills left to right and the arrow glides.
 */
export function LineCta({ href, children, tone = "plaster" }: Props) {
  const umber = tone === "umber";
  const text = umber ? "text-umber" : "text-plaster";
  return (
    <a
      href={href}
      className={`group block focus-visible:outline-2 focus-visible:outline-offset-8 ${
        umber ? "focus-visible:outline-umber" : "focus-visible:outline-plaster"
      }`}
    >
      <span className="flex items-end justify-between gap-6">
        <span className={`font-display text-[clamp(1.55rem,2.15vw,2.3rem)] leading-none ${text}`}>
          {children}
        </span>
        <ArrowRight
          size={22}
          weight="light"
          aria-hidden
          className={`mb-[0.1em] shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 ${text}`}
        />
      </span>
      <span className="relative mt-5 block h-px">
        <span aria-hidden className={`absolute inset-0 ${umber ? "bg-umber/30" : "bg-plaster/35"}`} />
        <span
          aria-hidden
          className={`absolute inset-0 origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 ${
            umber ? "bg-umber" : "bg-plaster"
          }`}
        />
      </span>
    </a>
  );
}
