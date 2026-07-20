/**
 * Shared layout wrapper for each walkthrough step.
 */

import type { ReactNode } from "react";

interface StepLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Title, subtitle, and content shell for a walkthrough step. */
export function StepLayout({ title, subtitle, children }: StepLayoutProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-1 leading-tight">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>
      {children}
    </div>
  );
}
