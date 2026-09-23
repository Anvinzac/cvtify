import { cv } from "@/lib/cvData";
import { SectionHeading } from "./SectionHeading";
import { ExperienceStage } from "./ExperienceStage";

/** The experience story: a heading followed by each pinned, photo-driven chapter. */
export function Experience() {
  return (
    <section id="experience" aria-label="Work experience">
      <div className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 sm:pt-32">
        <SectionHeading
          eyebrow="The journey"
          title={
            <>
              {cv.experience.length} chapters,{" "}
              <span className="text-primary">one direction</span>
            </>
          }
          description="Scroll through the roles that shaped how I think and work — each one a frame in the story of work, skills and self-discovery."
        />
      </div>
      <div className="mt-8 sm:mt-12">
        {cv.experience.map((stage, i) => (
          <ExperienceStage key={stage.id} stage={stage} index={i} total={cv.experience.length} />
        ))}
      </div>
    </section>
  );
}
