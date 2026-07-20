/**
 * Insights feature — domain types for recommendations and dream jobs.
 */

/** A sample or saved dream job card. */
export interface DreamJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  values: string[];
  salary: string;
  location: string;
  tags: string[];
  isFavorited?: boolean;
}
