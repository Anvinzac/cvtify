import { Hero } from "@/components/cv/Hero";
import { Manifesto } from "@/components/cv/Manifesto";
import { Experience } from "@/components/cv/Experience";
import { Skills } from "@/components/cv/Skills";
import { SelfDiscovery } from "@/components/cv/SelfDiscovery";
import { Gallery } from "@/components/cv/Gallery";
import { Contact } from "@/components/cv/Contact";
import { ScrollProgress } from "@/components/cv/ScrollProgress";
import { StageNav } from "@/components/cv/StageNav";

/**
 * The media CV: one continuous, scroll-driven story.
 * Hero (at-a-glance) -> Manifesto -> Experience chapters -> Skills ->
 * Self-discovery -> Gallery -> Contact.
 * Rendered as a dark cinematic outcome of the profile setup.
 */
const CV = () => {
  return (
    <div className="dark">
      <main className="relative bg-background text-foreground dark">
        <ScrollProgress />
        <StageNav />
        {/* Global film-grain overlay */}
        <div className="grain" aria-hidden />

        <Hero />
        <Manifesto />
        <Experience />
        <Skills />
        <SelfDiscovery />
        <Gallery />
        <Contact />
      </main>
    </div>
  );
};

export default CV;
