import { FooterDrawing } from "@/components/ui/FooterDrawing";

// Placeholder studio details and links. Replace with the studio's own.
const EXPLORE = [
  { label: "Studio", href: "#studio" },
  { label: "Projects", href: "#projects" },
  { label: "Approach", href: "#approach" },
  { label: "Clients", href: "#clients" },
  { label: "Questions", href: "#faq" },
] as const;

const FOLLOW = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "Pinterest", href: "https://www.pinterest.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
] as const;

/**
 * Footer. Dark umber, set out like the title block of a drawing sheet: hairline cells for the studio, where to
 * go, how to reach us and where to follow, then a thin legal row. At the foot, edge to edge, is a motion graphic: the
 * front elevation of a house that draws itself, lights up, comes alive and rubs out, on a loop (see FooterDrawing).
 * The whole footer is one screen tall. Only the drawing needs the client; the rest is server-rendered.
 */
export function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-inner">
        <div className="ftr-grid">
          <div className="ftr-cell ftr-studio">
            <p className="ftr-label">Studio</p>
            <p className="ftr-name font-display">Hallam &amp; Wren</p>
            <p className="ftr-text">
              Interior design and building for private residences.
              <br />
              14 Harcourt Mews, London NW3
            </p>
          </div>

          <nav aria-label="Explore" className="ftr-cell">
            <p className="ftr-label">Explore</p>
            <ul className="ftr-list">
              {EXPLORE.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ftr-cell">
            <p className="ftr-label">Contact</p>
            <ul className="ftr-list">
              <li>
                <a href="mailto:hello@hallamwren.com">hello@hallamwren.com</a>
              </li>
              <li>
                <a href="tel:+442079460000">020 7946 0000</a>
              </li>
              <li className="ftr-text">Monday to Friday, 9 to 6</li>
            </ul>
          </div>

          <nav aria-label="Follow" className="ftr-cell">
            <p className="ftr-label">Follow</p>
            <ul className="ftr-list">
              {FOLLOW.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="ftr-legal">
          <p>&copy; 2026 Hallam &amp; Wren Ltd. All rights reserved.</p>
          <ul>
            <li>
              <a href="/privacy">Privacy</a>
            </li>
            <li>
              <a href="/terms">Terms</a>
            </li>
            <li>
              <a href="#top">Back to top</a>
            </li>
          </ul>
        </div>
      </div>

      {/* At the foot of the footer, edge to edge: a house that draws itself, comes alive and rubs out, on a loop */}
      <FooterDrawing />
    </footer>
  );
}
