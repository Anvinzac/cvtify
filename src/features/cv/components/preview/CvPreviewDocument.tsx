/**
 * CV preview — printable document body rendered from draft CV data.
 *
 * Exports: CvPreviewDocument
 * Depends on: @/features/cv/types, formatters, previewHelpers, skillCategories
 */

import type { CvData } from "@/features/cv/types";
import { formatDateRange } from "@/features/cv/lib/formatters";
import { formatYear, descriptionBullets } from "@/features/cv/lib/previewHelpers";
import { SKILL_CATEGORIES } from "@/features/cv/lib/skillCategories";
import { CvSectionHeader, CvPreviewBlock } from "@/features/cv/components/preview/CvPreviewBlock";

interface CvPreviewDocumentProps {
  cv: CvData;
  onGoBack: () => void;
}

/** Renders the A4 CV paper content or an empty-state prompt. */
export function CvPreviewDocument({ cv, onGoBack }: CvPreviewDocumentProps) {
  const { personalInfo } = cv;

  const hasAnyData =
    personalInfo.fullName || cv.professionalSummary ||
    cv.workExperience.length > 0 || cv.education.length > 0 ||
    cv.skills.some((g) => g.skills.length > 0) || cv.certifications.length > 0 ||
    cv.languages.length > 0;

  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
  ].filter(Boolean);

  const linkParts = [
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

  if (!hasAnyData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-slate-400 text-lg mb-2">No CV data yet</p>
        <button
          onClick={onGoBack}
          className="text-sm text-blue-600 hover:underline"
        >
          Go back and add your details
        </button>
      </div>
    );
  }

  return (
    <>
      {personalInfo.fullName && (
        <CvSectionHeader name={personalInfo.fullName} />
      )}

      {(contactParts.length > 0 || linkParts.length > 0) && (
        <div className="text-center mb-5">
          {contactParts.length > 0 && (
            <p className="text-xs text-slate-600">
              {contactParts.join(" | ")}
            </p>
          )}
          {linkParts.length > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {linkParts.join(" | ")}
            </p>
          )}
        </div>
      )}

      {cv.professionalSummary && (
        <CvPreviewBlock title="Professional Summary">
          <p className="text-sm text-slate-700 leading-relaxed">
            {cv.professionalSummary}
          </p>
        </CvPreviewBlock>
      )}

      {cv.workExperience.length > 0 && (
        <CvPreviewBlock title="Work Experience">
          <div className="space-y-4">
            {cv.workExperience.map((exp) => (
              <div key={exp.id} className="cv-section">
                <div className="flex items-start justify-between mb-0.5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {exp.title}
                    </p>
                    <p className="text-sm text-slate-700 italic">
                      {exp.organization}
                      {exp.location ? `, ${exp.location}` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 whitespace-nowrap ml-3 mt-0.5">
                    {formatDateRange(exp)}
                  </p>
                </div>
                {exp.description && (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 mt-1">
                    {descriptionBullets(exp.description).map((b, i) => (
                      <li key={i} className="text-sm text-slate-700 leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CvPreviewBlock>
      )}

      {cv.education.length > 0 && (
        <CvPreviewBlock title="Education">
          <div className="space-y-3">
            {cv.education.map((edu) => (
              <div key={edu.id} className="cv-section">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {edu.title}
                    </p>
                    <p className="text-sm text-slate-700 italic">
                      {edu.organization}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 whitespace-nowrap ml-3 mt-0.5">
                    {formatDateRange(edu)}
                  </p>
                </div>
                {edu.description && (
                  <p className="text-sm text-slate-700 mt-1">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CvPreviewBlock>
      )}

      {cv.skills.some((g) => g.skills.length > 0) && (
        <CvPreviewBlock title="Skills">
          <div className="space-y-1.5">
            {cv.skills
              .filter((g) => g.skills.length > 0)
              .map((group) => {
                const cat = SKILL_CATEGORIES.find((c) => c.id === group.category);
                const label = cat?.label ?? group.category;
                return (
                  <p key={group.id} className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-bold">{label}:</span>{" "}
                    {group.skills.join(", ")}
                  </p>
                );
              })}
          </div>
        </CvPreviewBlock>
      )}

      {cv.certifications.length > 0 && (
        <CvPreviewBlock title="Certifications">
          <div className="space-y-2">
            {cv.certifications.map((cert) => (
              <div key={cert.id} className="cv-section flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {cert.title}
                  </p>
                  <p className="text-xs text-slate-600 italic">
                    {cert.organization}
                  </p>
                </div>
                <p className="text-xs text-slate-500 whitespace-nowrap ml-3 mt-0.5">
                  {formatYear(cert)}
                </p>
              </div>
            ))}
          </div>
        </CvPreviewBlock>
      )}

      {cv.languages.length > 0 && (
        <CvPreviewBlock title="Languages">
          <p className="text-sm text-slate-700 leading-relaxed">
            {cv.languages.join(", ")}
          </p>
        </CvPreviewBlock>
      )}
    </>
  );
}
