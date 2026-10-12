"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motionPaused, setMotionPaused } from "@/lib/motion";

// In page order. The id is the section's id on the page.
const LINKS = [
  { id: "studio", label: "Studio", href: "#studio" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "approach", label: "Approach", href: "#approach" },
  { id: "clients", label: "Clients", href: "#clients" },
  { id: "faq", label: "Questions", href: "#faq" },
] as const;

// What the readout beside the Menu says in each section
const READOUT: Record<string, string> = {
  studio: "Studio",
  projects: "Projects",
  approach: "Approach",
  clients: "Clients",
  faq: "Questions",
  contact: "Contact",
};

// Placeholder studio details. Replace with the studio's own.
const ADDRESS = "14 Harcourt Mews, London NW3";
const PHONE_LABEL = "020 7946 0000";
const PHONE_HREF = "tel:+442079460000";
const EMAIL = "hello@hallamwren.com";

function Arrow() {
  return (
    <svg width="26" height="9" viewBox="0 0 26 9" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <path d="M0 4.5H25M21.5 1l3.5 3.5L21.5 8" />
    </svg>
  );
}

/**
 * Navigation with no bar. A few things float over the page: the Menu control with a readout of the section you are
 * in, the wordmark in the centre, and one typographic button. The Menu opens a full-height drawer of plaster, wiped
 * in from the top, with the links set large in the display face and the studio's details underneath. Its background is
 * ruled in seven flutes, the site's one repeated motif.
 *
 * The type is light while the nav is over the video or the footer and dark over paper; the tone follows whatever is
 * under it. While the drawer is open the keyboard stays inside it; Escape, the scrim, choosing a link, or scrolling
 * away closes it. At the foot of the drawer a "Pause motion" control stops the page's looping motion (the hero film and
 * the footer drawing) for anyone who wants it still; it is remembered between visits and hidden when the device is
 * already set to reduced motion.
 */
export function Navbar() {
  const drawer = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [hero, setHero] = useState(true);
  const [section, setSection] = useState<string | null>(null);
  const [canPause, setCanPause] = useState(false);
  const [paused, setPaused] = useState(false);

  // Light type over the hero video and the footer, dark type everywhere else
  useEffect(() => {
    const heroEl = document.getElementById("top");
    const footer = document.querySelector("footer");
    let raf = 0;
    const probe = 44; // y of the middle of the nav row
    const update = () => {
      raf = 0;
      const h = heroEl?.getBoundingClientRect();
      const f = footer?.getBoundingClientRect();
      const overHero = !!h && h.top <= probe && h.bottom > probe;
      const overFooter = !!f && f.top <= probe;
      setHero(overHero);
      setTone(overHero || overFooter ? "light" : "dark");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // The section across the middle of the screen is the one you are in
  useEffect(() => {
    const ids = [...LINKS.map((l) => l.id), "contact", "top"];
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSection(entry.target.id === "top" ? null : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // The pause control follows the stored choice, and is not offered when the device already asks for reduced motion
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCanPause(!reduce.matches);
      setPaused(motionPaused());
    };
    sync();
    reduce.addEventListener("change", sync);
    window.addEventListener("motion:change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      window.removeEventListener("motion:change", sync);
    };
  }, []);

  // While the drawer is open: focus moves into it, the keyboard stays inside it, Escape closes it, and so does
  // scrolling away from where you opened it
  useEffect(() => {
    if (!open) return;
    drawer.current?.querySelector<HTMLElement>(".nv-dlinks a")?.focus({ preventScroll: true });
    const startY = window.scrollY;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const inside = [
        menuButton.current,
        ...Array.from(drawer.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []),
      ].filter((el): el is HTMLElement => el !== null);
      if (!inside.length) return;
      const first = inside[0];
      const last = inside[inside.length - 1];
      const here = document.activeElement as HTMLElement | null;
      const lost = !here || !inside.includes(here);
      if (e.shiftKey && (here === first || lost)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (here === last || lost)) {
        e.preventDefault();
        first.focus();
      }
    };
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 80) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  const readout = !hero && section ? READOUT[section] : null;

  return (
    <header className="site-nav" data-tone={tone} data-open={open}>
      <div className="nv-left">
        <button
          ref={menuButton}
          type="button"
          className="nv-menu"
          aria-expanded={open}
          aria-controls="nav-drawer"
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden className="nv-lines">
            <i />
            <i />
          </span>
          <span>{open ? "Close" : "Menu"}</span>
        </button>
        {readout && !open ? (
          <span key={readout} aria-hidden className="nv-here">
            {readout}
          </span>
        ) : null}
      </div>

      <a
        href="#top"
        className="nv-brand font-display"
        aria-label="Hallam & Wren, back to the top"
        inert={open}
        onClick={() => setOpen(false)}
      >
        Hallam &amp; Wren
      </a>

      <a href="#contact" className="nv-cta" inert={open}>
        <span className="nv-cta-t">Book a consultation</span>
        <Arrow />
      </a>

      <div className="nv-scrim" data-open={open} onClick={() => setOpen(false)} aria-hidden />

      <aside ref={drawer} id="nav-drawer" aria-label="Menu" className="nv-drawer" data-open={open} inert={!open} data-lenis-prevent>
        <nav aria-label="Primary">
          <ul className="nv-dlinks">
            {LINKS.map((l, i) => (
              <li key={l.id} style={{ "--i": i } as CSSProperties}>
                <a
                  href={l.href}
                  className="font-display"
                  aria-current={section === l.id ? "location" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nv-dfoot">
          <dl className="nv-info">
            <div>
              <dt>Address</dt>
              <dd>{ADDRESS}</dd>
            </div>
            <div>
              <dt>Telephone</dt>
              <dd>
                <a href={PHONE_HREF}>{PHONE_LABEL}</a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </dd>
            </div>
          </dl>
          <a href="#contact" className="nv-dcta" onClick={() => setOpen(false)}>
            <span>Book a consultation</span>
            <Arrow />
          </a>
          {canPause ? (
            <button type="button" className="nv-motion" aria-pressed={paused} onClick={() => setMotionPaused(!paused)}>
              {paused ? "Play motion" : "Pause motion"}
            </button>
          ) : null}
        </div>
      </aside>
    </header>
  );
}
