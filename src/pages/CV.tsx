import { Hero } from "@/components/cv/Hero";
import { Manifesto } from "@/components/cv/Manifesto";
import { Experience } from "@/components/cv/Experience";
import { Skills } from "@/components/cv/Skills";
import { SelfDiscovery } from "@/components/cv/SelfDiscovery";
import { Gallery } from "@/components/cv/Gallery";
import { Contact } from "@/components/cv/Contact";

/**
 * The media CV: one continuous, scroll-driven story.
 * Hero (at-a-glance) -> Manifesto -> Experience chapters -> Skills ->
 * Self-discovery -> Gallery -> Contact.
 */
const CV = () => {
  return (
    <main className="relative bg-background text-foreground">
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
  );
};

export default CV;
