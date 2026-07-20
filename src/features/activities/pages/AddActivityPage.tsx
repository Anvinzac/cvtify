/**
 * Standalone add-activity route — category param drives the walkthrough.
 */

import { useNavigate, useParams } from "react-router-dom";
import { CATEGORIES } from "@/features/activities/lib/catalog";
import type { Activity } from "@/features/activities/types";
import { useAppState } from "@/context/AppContext";
import ActivityWalkthrough from "@/features/activities/components/walkthrough/ActivityWalkthrough";

/** Full-page walkthrough for a single category from the URL. */
export default function AddActivityPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { addActivity } = useAppState();
  const category = CATEGORIES.find((c) => c.id === categoryId);

  if (!category) return null;

  const handleComplete = (activity: Activity) => {
    addActivity(activity);
    navigate("/categories");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      <ActivityWalkthrough
        category={category}
        onComplete={handleComplete}
        onClose={() => navigate(-1)}
      />
    </div>
  );
}
