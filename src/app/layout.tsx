import type { Metadata } from "next";
import { Bodoni_Moda, Geist } from "next/font/google";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display serif (luxury/editorial brief, so a serif is justified). Bodoni Moda is free (SIL OFL) with the same
// high-contrast character as the owner's choice, Mollie Glaston, which is licensed for personal use only and
// needs written permission for a commercial site. To switch back once licensed: put the font file in src/fonts/
// and replace this block with
//   const display = localFont({ src: "../fonts/MollieGlaston-Regular.otf", variable: "--font-display-src" });
// Nothing else needs to change. Display type is set in the regular weight only, with no italics.
const display = Bodoni_Moda({
  variable: "--font-display-src",
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
});

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
      <body className="min-h-full flex flex-col">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
