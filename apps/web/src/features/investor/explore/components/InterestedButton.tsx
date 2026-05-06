export function Placeholder() { return null; }
import { useState } from "react";
import { supabase } from "../../../../lib/supabase/client";

interface InterestedButtonProps {
  investorId: string;
  projectId: string;
  initialInterested: boolean;
  onChanged?: (value: boolean) => void;
}

export default function InterestedButton({
  investorId,
  projectId,
  initialInterested,
  onChanged,
}: InterestedButtonProps) {
  const [isInterested, setIsInterested] = useState(initialInterested);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleToggle() {
    try {
      setIsSubmitting(true);
      setMessage("");

      if (isInterested) {
        const { error } = await supabase
          .from("investor_project_interests")
          .delete()
          .eq("investor_id", investorId)
          .eq("project_id", projectId);

        if (error) {
          throw error;
        }

        setIsInterested(false);
        setMessage("تمت إزالة المشروع من قائمة الاهتمام.");
        onChanged?.(false);
        return;
      }

      const { error } = await supabase.from("investor_project_interests").insert({
        investor_id: investorId,
        project_id: projectId,
      });

      if (error) {
        throw error;
      }

      setIsInterested(true);
      setMessage("تمت إضافة المشروع إلى قائمة الاهتمام.");
      onChanged?.(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "تعذر تحديث حالة الاهتمام.";
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="project-interest-button-wrap">
      <button
        type="button"
        className={isInterested ? "btn btn--secondary" : "btn btn--ghost"}
        onClick={handleToggle}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "جاري التحديث..."
          : isInterested
          ? "إزالة من الاهتمام"
          : "تحديد كمشروع مهتم به"}
      </button>

      {message ? <p className="project-inline-note">{message}</p> : null}
    </div>
  );
}