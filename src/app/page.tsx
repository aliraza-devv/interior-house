import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Navbar } from "@/components/ui/Navbar";
import { StoryScroll } from "@/components/ui/StoryScroll";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Process />
      </main>
      <StoryScroll />
    </>
  );
}
