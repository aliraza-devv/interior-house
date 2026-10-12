import { About } from "@/components/sections/About";
import { Cta } from "@/components/sections/Cta";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Navbar } from "@/components/ui/Navbar";
import { StoryScroll } from "@/components/ui/StoryScroll";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* id and tabIndex: the "Skip to content" link lands here, and focus goes with it */}
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Gallery />
        <Process />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <StoryScroll />
    </>
  );
}
