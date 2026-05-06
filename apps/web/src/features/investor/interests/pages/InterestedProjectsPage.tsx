import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import InterestedProjectsList from "../components/InterestedProjectsList";
import type { InterestedProjectItem } from "../components/InterestedProjectCard";

type InterestRow = {
  id: string;
  project_id: string;
  created_at: string;
};

type ProjectRow = {
  id: string;
  title: string;
  company_name: string;
  short_pitch: string | null;
  startup_stage: string | null;
  confidence_level: string | null;
  investment_status: string | null;
};

type EvaluationRow = {
  project_id: string;
  risk_level: string | null;
  risk_score: number | null;
  ai_summary: string | null;
  created_at: string;
};

export default function InterestedProjectsPage() {
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [items, setItems] = useState<InterestedProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      if (!appUser || appUser.role !== "investor") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setPageError("");

        const interestsResponse = await supabase
          .from("investor_project_interests")
          .select("id, project_id, created_at")
          .eq("investor_id", appUser.id)
          .order("created_at", { ascending: false });

        if (interestsResponse.error) {
          throw interestsResponse.error;
        }

        const interests = (interestsResponse.data ?? []) as InterestRow[];

        if (interests.length === 0) {
          setItems([]);
          setIsLoading(false);
          return;
        }

        const projectIds = interests.map((item: InterestRow) => item.project_id);

        const [projectsResponse, evaluationsResponse] = await Promise.all([
          supabase
            .from("projects")
            .select(
              "id, title, company_name, short_pitch, startup_stage, confidence_level, investment_status"
            )
            .in("id", projectIds),
          supabase
            .from("project_ai_evaluations")
            .select("project_id, risk_level, risk_score, ai_summary, created_at")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false }),
        ]);

        if (projectsResponse.error) {
          throw projectsResponse.error;
        }

        if (evaluationsResponse.error) {
          throw evaluationsResponse.error;
        }

        const projects = (projectsResponse.data ?? []) as ProjectRow[];
        const evaluations = (evaluationsResponse.data ?? []) as EvaluationRow[];

        const projectsMap = new Map<string, ProjectRow>();
        projects.forEach((project: ProjectRow) => {
          projectsMap.set(project.id, project);
        });

        const evaluationMap = new Map<string, EvaluationRow>();
        evaluations.forEach((evaluation: EvaluationRow) => {
          if (!evaluationMap.has(evaluation.project_id)) {
            evaluationMap.set(evaluation.project_id, evaluation);
          }
        });

        const mappedItems = interests
          .map((interest: InterestRow) => {
            const project = projectsMap.get(interest.project_id);

            if (!project) {
              return null;
            }

            const evaluation = evaluationMap.get(project.id);

            return {
              interestId: interest.id,
              projectId: project.id,
              title: project.title,
              companyName: project.company_name,
              shortPitch: project.short_pitch ?? "",
              startupStage: project.startup_stage,
              confidenceLevel: project.confidence_level,
              investmentStatus: project.investment_status,
              riskLevel: evaluation?.risk_level ?? null,
              riskScore: evaluation?.risk_score ?? null,
              aiSummary: evaluation?.ai_summary ?? null,
              interestedAt: interest.created_at,
            };
          })
          .filter((item): item is InterestedProjectItem => Boolean(item));

        setItems(mappedItems);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل المشاريع المهتم بها حالياً.";
        setPageError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadPage();
  }, [appUser]);

  async function handleRemoveInterest(interestId: string) {
    if (!appUser) {
      return;
    }

    try {
      setRemovingId(interestId);

      const deleteResponse = await supabase
        .from("investor_project_interests")
        .delete()
        .eq("id", interestId)
        .eq("investor_id", appUser.id);

      if (deleteResponse.error) {
        throw deleteResponse.error;
      }

      setItems((current) => current.filter((item) => item.interestId !== interestId));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "تعذر إزالة المشروع من قائمة الاهتمامات.";
      setPageError(message);
    } finally {
      setRemovingId(null);
    }
  }

  const totalItems = useMemo(() => items.length, [items]);

  if (isAuthLoading || isLoading) {
    return <div className="page-loading">جارٍ تحميل المشاريع المهتم بها...</div>;
  }

  if (!appUser || appUser.role !== "investor") {
    return <div className="page-error">تعذر التحقق من حساب المستثمر الحالي.</div>;
  }

  return (
    <section className="investor-page interests-page">
      <div className="investor-page__header">
        <div>
          <h1 className="investor-page__title">المشاريع المهتم بها</h1>
          <p className="investor-page__subtitle">
            جميع المشاريع التي قمت بوضع علامة اهتمام عليها للوصول السريع واتخاذ القرار.
          </p>
        </div>

        <div className="investor-page__actions">
          <Link to="/investor/explore" className="btn btn--secondary">
            استكشاف المشاريع
          </Link>
        </div>
      </div>

      <div className="investor-summary-strip">
        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">إجمالي الاهتمامات</span>
          <strong className="investor-summary-strip__value">{totalItems}</strong>
        </div>
      </div>

      {pageError ? <div className="page-error">{pageError}</div> : null}

      {!items.length ? (
        <div className="page-empty">
          <h2>لا توجد مشاريع محفوظة حالياً</h2>
          <p>ابدأ من صفحة الاستكشاف ثم اختر المشاريع التي تهمك لتظهر هنا.</p>
          <Link to="/investor/explore" className="btn btn--primary">
            الذهاب إلى الاستكشاف
          </Link>
        </div>
      ) : (
        <InterestedProjectsList
          items={items}
          removingId={removingId}
          onRemove={handleRemoveInterest}
        />
      )}
    </section>
  );
}