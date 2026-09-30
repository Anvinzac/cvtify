/* ------------------------------------------------------------------
 * DEMO PROJECT — turns the Vietnamese sample persona in cvData.ts into a
 * full GradProject so first-time visitors see the live CV populated.
 * Photos are picsum placeholder URLs (see photoSchema's https allowance).
 * ------------------------------------------------------------------ */
import { gradCvData } from "./cvData";
import { defaultSettings, newId, type GradProject, type MediaPhoto } from "./mediaProject";

const toPhoto = (src: string, alt: string, width: number, height: number, caption = ""): MediaPhoto => ({
  id: newId(),
  name: "",
  src,
  alt,
  caption,
  position: "center",
  width,
  height,
});

export function demoProject(): GradProject {
  return {
    version: 2,
    profile: {
      name: gradCvData.profile.name,
      objective: gradCvData.profile.objective,
      email: gradCvData.profile.email,
      phone: gradCvData.profile.phone,
      dob: gradCvData.profile.dob,
      address: gradCvData.profile.address,
      photo: gradCvData.profile.photoUrl
        ? toPhoto(gradCvData.profile.photoUrl, "Ảnh chân dung", 400, 400)
        : null,
    },
    education: {
      school: gradCvData.education.school,
      major: gradCvData.education.major,
      gpa: gradCvData.education.gpa,
      startDate: gradCvData.education.startDate,
      endDate: gradCvData.education.endDate,
      honors: gradCvData.education.honors,
      certificates: gradCvData.education.certificates.map((c) => ({ id: newId(), ...c })),
      photo: gradCvData.education.photoUrl
        ? toPhoto(gradCvData.education.photoUrl, "Khuôn viên trường", 800, 500)
        : null,
    },
    activities: gradCvData.activities.map((a) => ({
      id: newId(),
      title: a.title,
      organization: a.organization,
      location: a.location,
      startDate: a.startDate,
      endDate: a.endDate,
      current: false,
      description: a.description,
      highlights: a.highlights,
      photos: a.photoUrl ? [toPhoto(a.photoUrl, a.title, 600, 400)] : [],
    })),
    internships: gradCvData.internships.map((i) => ({
      id: newId(),
      title: i.title,
      organization: i.organization,
      location: i.location,
      startDate: i.startDate,
      endDate: i.endDate,
      current: false,
      description: i.description,
      highlights: i.highlights,
      photos: i.photoUrl ? [toPhoto(i.photoUrl, i.title, 600, 400)] : [],
    })),
    partTimeJobs: gradCvData.partTimeJobs.map((j) => ({
      id: newId(),
      title: j.title,
      organization: j.organization,
      location: j.location,
      startDate: j.startDate,
      endDate: j.endDate,
      current: j.current ?? false,
      description: j.description,
      highlights: j.highlights,
      photos: j.photoUrl ? [toPhoto(j.photoUrl, j.title, 600, 400)] : [],
    })),
    skills: gradCvData.skills.join(", "),
    hobbies: gradCvData.hobbies.join(", "),
    settings: { ...defaultSettings },
  };
}

/**
 * Mirror of the seeded demo, used by the live editor to recognise untouched
 * example content and offer tap-to-wipe / revert / clear behaviour.
 */
export function demoSamples(): GradProject {
  return demoProject();
}
