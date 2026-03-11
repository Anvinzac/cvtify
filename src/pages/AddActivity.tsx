import { useNavigate, useParams } from "react-router-dom";
import { CATEGORIES } from "@/lib/data";
import { useAppState } from "@/context/AppContext";
import ActivityWalkthrough from "@/components/ActivityWalkthrough";
import type { Activity } from "@/lib/data";

const AddActivity = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { addActivity } = useAppState();
  const category = CATEGORIES.find((c) => c.id === categoryId);

  if (!category) return null;

  const handleComplete = (activity: Activity) => {
    addActivity(activity);
    navigate("/dashboard");
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
};

export default AddActivity;
