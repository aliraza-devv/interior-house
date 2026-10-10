import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display serif, chosen by the owner: Mollie Glaston. It has a single Regular weight and no italic, so never set
// italics or font weights on display type. LICENSE: the 1001fonts download is free for personal use only.
// A commercial site needs written permission from the author before launch.
const display = localFont({
  src: "../fonts/MollieGlaston-Regular.otf",
  variable: "--font-display-src",
  weight: "400",
  style: "normal",
  display: "swap",
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
