const LINKS = [
  { label: "Projects", href: "#projects" },
  { label: "Approach", href: "#approach" },
  { label: "Studio", href: "#studio" },
  { label: "Journal", href: "#journal" },
] as const;

/**
 * Floating translucent bar (web approximation of a frosted material, not an official Apple asset).
 * Content scrolls underneath it, so there is no opaque strip and no divider line.
 */
export function Navbar() {
  return (
    <header className="site-nav fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-6">
      <nav
        aria-label="Primary"
        className="glass mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 rounded-full border border-line/70 bg-canvas/65 pl-6 pr-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] backdrop-blur-xl backdrop-saturate-150"
      >
        <a
          href="#top"
          className="whitespace-nowrap font-display text-[1.2rem] leading-none md:text-[1.45rem] tracking-[-0.01em] text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Hallam &amp; Wren
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[13px] tracking-[0.02em] text-muted transition-colors duration-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-ink px-4 text-[12px] md:px-5 md:text-[13px] tracking-[0.01em] text-on-ink transition-[background-color,scale] duration-300 hover:bg-accent active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Book a consultation
        </a>
      </nav>
    </header>
  );
}
