/**
 * CV feature — print-ready preview page with toolbar.
 *
 * Exports: CvPreviewPage (default)
 * Depends on: @/shared/app-state/AppContext, CvPreviewDocument
 */

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Printer } from "lucide-react";
import { useAppState } from "@/shared/app-state/AppContext";
import { CvPreviewDocument } from "@/features/cv/components/preview/CvPreviewDocument";

export default function CvPreviewPage() {
  const navigate = useNavigate();
  const { cv } = useAppState();

  return (
    <div className="min-h-[100dvh] bg-slate-100 py-6 px-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[210mm] mx-auto"
      >
        <div className="flex items-center justify-between mb-4 no-print">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-warm text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        <div className="cv-paper bg-white shadow-xl rounded-none min-h-[297mm] px-6 py-8 sm:px-[18mm] sm:py-[16mm] md:px-[22mm] md:py-[18mm]">
          <CvPreviewDocument cv={cv} onGoBack={() => navigate("/")} />
        </div>
      </motion.div>
    </div>
  );
}
