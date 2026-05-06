import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import MyProjectsTable, { type MyProjectItem } from "../components/MyProjectsTable";

type ProjectRow = {
  id: string;
  title: string;
  company_name: string | null;
  category_id: string | null;
  startup_stage: string | null;
  confidence_level: string | null;
  created_at: string;
  approval_status: string;
  publication_status: string;
  investment_status: string;
};

type CategoryRow = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
};

type EvaluationRow = {
  id: string;
  project_id: string;
  risk_level: string | null;
  risk_score: number | null;
  ai_summary: string | null;
  created_at: string;
};

type OfferRow = {
  id: string;
  project_id: string;
};

function formatStage(value: string | null) {
  if (!value) {
    return "غير محدد";
  }

  switch (value) {
    case "idea":
      return "فكرة";
    case "mvp_seed":
      return "بذرة / MVP";
    default:
      return value;
  }
}

function formatConfidence(value: string | null) {
  if (!value) {
    return "غير محدد";
  }

  switch (value) {
    case "concept":
      return "مفهوم";
    case "prototype":
      return "نموذج أولي";
    case "mvp":
      return "MVP";
    case "early_market":
      return "سوق مبكر";
    default:
      return value;
  }
}

export default function MyProjectsPage() {
  const { appUser, isLoading } = useAuthUser();

  const [projects, setProjects] = useState<MyProjectItem[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submittingProjectId, setSubmittingProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [publicationStatus, setPublicationStatus] = useState("all");
  const [investmentStatus, setInvestmentStatus] = useState("all");

  useEffect(() => {
    async function loadProjects() {
      if (!appUser || appUser.role !== "entrepreneur") {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const { data: projectRows, error: projectsError } = await supabase
          .from("projects")
          .select(
            "id,title,company_name,category_id,startup_stage,confidence_level,created_at,approval_status,publication_status,investment_status"
          )
          .eq("entrepreneur_id", appUser.id)
          .order("created_at", { ascending: false });

        if (projectsError) {
          throw projectsError;
        }

        const safeProjects = (projectRows ?? []) as ProjectRow[];

        if (!safeProjects.length) {
          setProjects([]);
          return;
        }

        const projectIds = safeProjects.map((item: ProjectRow) => item.id);
        const categoryIds = safeProjects
          .map((item: ProjectRow) => item.category_id)
          .filter((value: string | null): value is string => Boolean(value));

        const [{ data: categoryRows }, { data: evaluationRows }, { data: offerRows }] =
          await Promise.all([
            categoryIds.length
              ? supabase
                  .from("project_categories")
                  .select("id,name_ar,name_en")
                  .in("id", categoryIds)
              : Promise.resolve({ data: [] as CategoryRow[] }),
            supabase
              .from("project_ai_evaluations")
              .select("id,project_id,risk_level,risk_score,ai_summary,created_at")
              .in("project_id", projectIds)
              .order("created_at", { ascending: false }),
            supabase.from("investment_offers").select("id,project_id").in("project_id", projectIds),
          ]);

        const categoryMap = new Map<string, CategoryRow>();
        ((categoryRows ?? []) as CategoryRow[]).forEach((item: CategoryRow) => {
          categoryMap.set(item.id, item);
        });

        const evaluationMap = new Map<string, EvaluationRow>();
        ((evaluationRows ?? []) as EvaluationRow[]).forEach((item: EvaluationRow) => {
          if (!evaluationMap.has(item.project_id)) {
            evaluationMap.set(item.project_id, item);
          }
        });

        const offersCounter = new Map<string, number>();
        ((offerRows ?? []) as OfferRow[]).forEach((item: OfferRow) => {
          const current = offersCounter.get(item.project_id) ?? 0;
          offersCounter.set(item.project_id, current + 1);
        });

        const mappedProjects: MyProjectItem[] = safeProjects.map((project: ProjectRow) => {
          const category = project.category_id ? categoryMap.get(project.category_id) : undefined;
          const evaluation = evaluationMap.get(project.id);

          return {
            id: project.id,
            title: project.title,
            companyName: project.company_name?.trim() || "بدون اسم جهة",
            categoryName: category?.name_ar?.trim() || category?.name_en?.trim() || "غير مصنف",
            startupStage: formatStage(project.startup_stage),
            confidenceLevel: formatConfidence(project.confidence_level),
            createdAt: project.created_at,
            approvalStatus: project.approval_status,
            publicationStatus: project.publication_status,
            investmentStatus: project.investment_status,
            offersCount: offersCounter.get(project.id) ?? 0,
            riskLevel: evaluation?.risk_level ?? null,
            riskScore: evaluation?.risk_score ?? null,
            aiSummary: evaluation?.ai_summary ?? null,
          };
        });

        setProjects(mappedProjects);
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل المشاريع حالياً.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadProjects();
  }, [appUser]);

  async function handleSubmitProject(projectId: string) {
    if (!appUser) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setSubmittingProjectId(projectId);

      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          approval_status: "under_review",
          submitted_at: now,
          updated_at: now,
        })
        .eq("id", projectId)
        .eq("entrepreneur_id", appUser.id);

      if (updateError) {
        throw updateError;
      }

      const { error: actionError } = await supabase.from("project_actions").insert({
        project_id: projectId,
        actor_id: appUser.id,
        action_type: "submitted",
        note: "تم إرسال المشروع للمراجعة",
        metadata: {
          source: "my_projects_page",
        },
        created_at: now,
      });

      if (actionError) {
        throw actionError;
      }

      setProjects((current: MyProjectItem[]) =>
        current.map((item: MyProjectItem) =>
          item.id === projectId
            ? {
                ...item,
                approvalStatus: "under_review",
              }
            : item
        )
      );

      setSuccessMessage("تم إرسال المشروع للمراجعة بنجاح.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر إرسال المشروع للمراجعة.";
      setErrorMessage(message);
    } finally {
      setSubmittingProjectId(null);
    }
  }

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project: MyProjectItem) => {
      const matchesSearch =
        !normalizedSearch ||
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.companyName.toLowerCase().includes(normalizedSearch) ||
        project.categoryName.toLowerCase().includes(normalizedSearch);

      const matchesApproval = approvalStatus === "all" || project.approvalStatus === approvalStatus;
      const matchesPublication =
        publicationStatus === "all" || project.publicationStatus === publicationStatus;
      const matchesInvestment =
        investmentStatus === "all" || project.investmentStatus === investmentStatus;

      return matchesSearch && matchesApproval && matchesPublication && matchesInvestment;
    });
  }, [projects, search, approvalStatus, publicationStatus, investmentStatus]);

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل المشاريع...</div>
      </section>
    );
  }

  if (!appUser || appUser.role !== "entrepreneur") {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">تعذر التحقق من حساب رائد الأعمال.</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-page entrepreneur-projects-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">مشاريعي</h1>
          <p className="entrepreneur-page__subtitle">
            هنا تتابع حالة مشاريعك، وتفتح التقييم الذكي، وتعيد إرسال المشروع عند الحاجة.
          </p>
        </div>

        <Link to="/entrepreneur/projects/create" className="btn btn--primary">
          إنشاء مشروع جديد
        </Link>
      </div>

      <div className="entrepreneur-toolbar">
        <div className="entrepreneur-toolbar__search">
          <label htmlFor="project-search">البحث</label>
          <input
            id="project-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم المشروع أو الشركة أو التصنيف"
          />
        </div>

        <div className="entrepreneur-toolbar__filters">
          <div>
            <label htmlFor="approval-filter">حالة الاعتماد</label>
            <select
              id="approval-filter"
              value={approvalStatus}
              onChange={(event) => setApprovalStatus(event.target.value)}
            >
              <option value="all">الكل</option>
              <option value="draft">مسودة</option>
              <option value="submitted">تم الإرسال</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="approved">معتمد</option>
              <option value="rejected">مرفوض</option>
              <option value="changes_requested">مطلوب تعديل</option>
            </select>
          </div>

          <div>
            <label htmlFor="publication-filter">حالة النشر</label>
            <select
              id="publication-filter"
              value={publicationStatus}
              onChange={(event) => setPublicationStatus(event.target.value)}
            >
              <option value="all">الكل</option>
              <option value="private">خاص</option>
              <option value="published">منشور</option>
              <option value="hidden">مخفي</option>
              <option value="archived">مؤرشف</option>
            </select>
          </div>

          <div>
            <label htmlFor="investment-filter">حالة الاستثمار</label>
            <select
              id="investment-filter"
              value={investmentStatus}
              onChange={(event) => setInvestmentStatus(event.target.value)}
            >
              <option value="all">الكل</option>
              <option value="open">مفتوح</option>
              <option value="in_negotiation">تحت التفاوض</option>
              <option value="funded">تم التمويل</option>
              <option value="closed">مغلق</option>
            </select>
          </div>
        </div>
      </div>

      {successMessage ? <div className="entrepreneur-page__success">{successMessage}</div> : null}
      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <MyProjectsTable
        projects={filteredProjects}
        submittingProjectId={submittingProjectId}
        onSubmitProject={handleSubmitProject}
      />
    </section>
  );
}