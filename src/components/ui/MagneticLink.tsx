"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type Variant = "primary" | "quiet" | "light" | "quiet-light" | "quiet-stone" | "stone";

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/**
 * primary / light / stone: pill that leans toward the cursor and shifts to the accent on hover.
 *   light is the inverted version for sitting on video, stone is the fixed-colour version for the stone background.
 * quiet / quiet-light / quiet-stone: text link with a hairline underline. quiet-light is for video, quiet-stone for
 *   the fixed stone section (umber text in both colour schemes).
 * Feedback is instant on press (scale). The magnetic pull is fine pointers only, motion allowed only.
 */
export function MagneticLink({ href, children, variant = "primary", className = "" }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const isPill = variant === "primary" || variant === "light" || variant === "stone";

  useEffect(() => {
    const el = ref.current;
    if (!el || !isPill) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // Pull is a fraction of the cursor's offset from centre, so it never wanders far from its slot
      xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [isPill]);

  if (!isPill) {
    const onVideo = variant === "quiet-light";
    const onStone = variant === "quiet-stone";
    return (
      <a
        ref={ref}
        href={href}
        className={`group relative -my-1 inline-flex min-h-11 items-center py-2 text-sm tracking-[0.01em] transition-colors duration-300 ${FOCUS} ${
          onVideo ? "text-plaster" : onStone ? "text-umber" : "text-ink hover:text-accent"
        } ${className}`}
      >
        {children}
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-2 h-px origin-left transition-colors duration-300 ${
            onVideo
              ? "bg-plaster/45 group-hover:bg-plaster"
              : onStone
                ? "bg-umber/30 group-hover:bg-umber"
                : "bg-line group-hover:bg-accent"
          }`}
        />
      </a>
    );
  }

  const onVideo = variant === "light";
  const onStone = variant === "stone";
  return (
    <a
      ref={ref}
      href={href}
      className={`group inline-flex h-12 items-center gap-4 py-1 pl-6 pr-1 text-sm tracking-[0.01em] transition-[background-color,color,scale] duration-300 hover:bg-accent hover:text-on-ink active:scale-[0.97] ${FOCUS} ${
        onVideo ? "bg-plaster text-umber" : onStone ? "bg-umber text-plaster" : "bg-ink text-on-ink"
      } ${className}`}
    >
      {children}
      <span
        className={`grid size-10 place-items-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 ${
          onVideo ? "bg-umber text-plaster" : onStone ? "bg-plaster text-umber" : "bg-canvas text-ink"
        }`}
      >
        <ArrowRight size={16} weight="regular" aria-hidden />
      </span>
    </a>
  );
}
