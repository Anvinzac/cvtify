import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Printer } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { CvEntry } from "@/lib/storage";

function formatDate(entry: CvEntry): string {
  const fmt = (d: string) => {
    const [y, m] = d.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m) - 1] ?? ""} ${y}`;
  };
  const start = fmt(entry.startDate);
  if (entry.isCurrent) return `${start} – Present`;
  if (entry.endDate) return `${start} – ${fmt(entry.endDate)}`;
  return start;
}

function formatYear(entry: CvEntry): string {
  return entry.startDate.split("-")[0] ?? "";
}

function descriptionBullets(text: string): string[] {
  return text
    .split(/\n|•|-/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function CvPreview() {
  const navigate = useNavigate();
  const { cv } = useAppState();
  const { personalInfo } = cv;

  const hasAnyData =
    personalInfo.fullName || cv.professionalSummary ||
    cv.workExperience.length > 0 || cv.education.length > 0 ||
    cv.skills.length > 0 || cv.certifications.length > 0 ||
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

  const handlePrint = () => window.print();

  return (
    <div className="min-h-[100dvh] bg-slate-100 py-6 px-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[210mm] mx-auto"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 no-print">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-warm text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* CV Paper */}
        <div className="cv-paper bg-white shadow-xl rounded-none">
          {!hasAnyData ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="text-slate-400 text-lg mb-2">No CV data yet</p>
              <button
                onClick={() => navigate("/")}
                className="text-sm text-blue-600 hover:underline"
              >
                Go back and add your details
              </button>
            </div>
          ) : (
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
                <CvBlock title="Professional Summary">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {cv.professionalSummary}
                  </p>
                </CvBlock>
              )}

              {cv.workExperience.length > 0 && (
                <CvBlock title="Work Experience">
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
                            {formatDate(exp)}
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
                </CvBlock>
              )}

              {cv.education.length > 0 && (
                <CvBlock title="Education">
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
                            {formatDate(edu)}
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
                </CvBlock>
              )}

              {cv.skills.length > 0 && (
                <CvBlock title="Skills">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {cv.skills.join(", ")}
                  </p>
                </CvBlock>
              )}

              {cv.certifications.length > 0 && (
                <CvBlock title="Certifications">
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
                </CvBlock>
              )}

              {cv.languages.length > 0 && (
                <CvBlock title="Languages">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {cv.languages.join(", ")}
                  </p>
                </CvBlock>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CvSectionHeader({ name }: { name: string }) {
  return (
    <div className="text-center mb-5">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {name}
      </h1>
    </div>
  );
}

function CvBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 cv-section">
      <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-[0.15em] border-b-2 border-slate-200 pb-1 mb-2.5">
        {title}
      </h2>
      {children}
    </div>
  );
}
