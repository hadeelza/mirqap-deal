import { Link } from "react-router-dom";
import ProjectStatusCard from "./ProjectStatusCard";

export type MyProjectItem = {
  id: string;
  title: string;
  companyName: string;
  categoryName: string;
  startupStage: string;
  confidenceLevel: string;
  createdAt: string;
  approvalStatus: string;
  publicationStatus: string;
  investmentStatus: string;
  offersCount: number;
  riskLevel: string | null;
  riskScore: number | null;
  aiSummary: string | null;
};

type MyProjectsTableProps = {
  projects: MyProjectItem[];
  submittingProjectId: string | null;
  onSubmitProject: (projectId: string) => Promise<void>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatRiskLevel(value: string | null) {
  if (!value) {
    return "لا يوجد";
  }

  switch (value) {
    case "low":
      return "منخفضة";
    case "medium":
      return "متوسطة";
    case "high":
      return "مرتفعة";
    default:
      return value;
  }
}

function formatScore(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function getSubmitLabel(status: string) {
  switch (status) {
    case "draft":
      return "إرسال للمراجعة";
    case "changes_requested":
      return "إعادة الإرسال";
    case "rejected":
      return "إعادة الإرسال";
    default:
      return "";
  }
}

function canSubmit(status: string) {
  return status === "draft" || status === "changes_requested" || status === "rejected";
}

export default function MyProjectsTable({
  projects,
  submittingProjectId,
  onSubmitProject,
}: MyProjectsTableProps) {
  if (!projects.length) {
    return (
      <div className="entrepreneur-empty-state">
        <h3>لا توجد مشاريع مطابقة</h3>
        <p>جرّب تغيير البحث أو الفلاتر أو أنشئ مشروعك الأول.</p>
        <Link to="/entrepreneur/projects/create" className="btn btn--primary">
          إنشاء مشروع جديد
        </Link>
      </div>
    );
  }

  return (
    <div className="entrepreneur-projects-grid">
      {projects.map((project) => (
        <article key={project.id} className="entrepreneur-project-card">
          <div className="entrepreneur-project-card__top">
            <div>
              <h3 className="entrepreneur-project-card__title">{project.title}</h3>
              <p className="entrepreneur-project-card__company">{project.companyName}</p>
            </div>

            <Link to={`/entrepreneur/projects/${project.id}`} className="btn btn--ghost btn--sm">
              التفاصيل
            </Link>
          </div>

          <div className="entrepreneur-project-card__meta">
            <span>{project.categoryName}</span>
            <span>{project.startupStage}</span>
            <span>مستوى الثقة: {project.confidenceLevel}</span>
            <span>{formatDate(project.createdAt)}</span>
          </div>

          <ProjectStatusCard
            approvalStatus={project.approvalStatus}
            publicationStatus={project.publicationStatus}
            investmentStatus={project.investmentStatus}
            offersCount={project.offersCount}
          />

          <div className="entrepreneur-project-card__ai">
            <div className="entrepreneur-project-card__ai-item">
              <strong>المخاطر</strong>
              <span>{formatRiskLevel(project.riskLevel)}</span>
            </div>
            <div className="entrepreneur-project-card__ai-item">
              <strong>السكور</strong>
              <span>{formatScore(project.riskScore)}</span>
            </div>
          </div>

          <p className="entrepreneur-project-card__summary">
            {project.aiSummary?.trim() || "لا يوجد ملخص ذكاء اصطناعي محفوظ لهذا المشروع حتى الآن."}
          </p>

          <div className="entrepreneur-project-card__actions">
            <Link to={`/entrepreneur/projects/${project.id}/edit`} className="btn btn--ghost">
              تعديل المشروع
            </Link>

            <Link to={`/entrepreneur/projects/${project.id}/evaluation`} className="btn btn--ghost">
              صفحة التقييم
            </Link>

            {canSubmit(project.approvalStatus) ? (
              <button
                type="button"
                className="btn btn--primary"
                disabled={submittingProjectId === project.id}
                onClick={() => void onSubmitProject(project.id)}
              >
                {submittingProjectId === project.id
                  ? "جارٍ الإرسال..."
                  : getSubmitLabel(project.approvalStatus)}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}