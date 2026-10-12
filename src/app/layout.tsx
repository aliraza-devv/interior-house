import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Geist } from "next/font/google";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display serif. The site's face is Mollie Glaston, declared with @font-face in globals.css and served from
// /public/Fonts (git-ignored: it is licensed for personal use only, and a commercial site needs the author's
// written permission). This Bodoni Moda (free, SIL OFL) is only the fallback in the font stack, so a fresh clone
// without the file still builds and renders in a similar high-contrast serif. Display type is the regular weight only.
// preload is off: it is a fallback, so it is fetched only if it is ever needed (it was costing every visitor ~85 KB).
const display = Bodoni_Moda({
  variable: "--font-display-src",
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  preload: false,
});

// The site is light only (see globals.css), so it says so: browser controls and the scrollbar follow
export const viewport: Viewport = {
  themeColor: "#c4beb1", // stone, the colour of the first screens
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: "Hallam & Wren | Luxury interior design, London",
  description:
    "A London studio designing and delivering private residences end to end. Book a consultation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-loading="true"
      className={`${geistSans.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        {/* Open the connections to the photograph and film hosts while the page is still being parsed */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://videos.pexels.com" />
        {/* Fetch the display face at once, so the loader counter and the hero never draw in a fallback */}
        <link rel="preload" href="/Fonts/MollieGlaston-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      {/* Browser extensions (a password manager, a task tool) add classes to <body> before React loads; that is not a bug here */}
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {/* First stop for the keyboard: it appears only when focused, and lands on the page's <main> */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
