import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import type { DashboardProjectCard } from "../pages/EntrepreneurDashboardPage";

type MyRecentProjectsSectionProps = {
  projects: DashboardProjectCard[];
};

function formatDate(value: string) {
  if (!value) return "غير محدد";

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function mapRiskLabel(value: string | null) {
  if (!value) return "لا يوجد تحليل";
  if (value === "low" || value === "منخفضة") return "منخفضة";
  if (value === "medium" || value === "متوسطة") return "متوسطة";
  if (value === "high" || value === "مرتفعة") return "مرتفعة";
  return value;
}

function mapRiskClassName(value: string | null) {
  if (!value) return "risk-pill risk-pill--neutral";
  if (value === "low" || value === "منخفضة") return "risk-pill risk-pill--low";
  if (value === "medium" || value === "متوسطة") return "risk-pill risk-pill--medium";
  if (value === "high" || value === "مرتفعة") return "risk-pill risk-pill--high";
  return "risk-pill risk-pill--neutral";
}

function mapPublicationStatus(value: string) {
  if (value === "published") return "منشور";
  if (value === "private") return "خاص";
  if (value === "hidden") return "مخفي";
  if (value === "archived") return "مؤرشف";
  return value;
}

export default function MyRecentProjectsSection({ projects }: MyRecentProjectsSectionProps) {
  return (
    <div className="panel-section-card">
      <div className="panel-section-card__header">
        <div>
          <h3 className="panel-section-card__title">أحدث المشاريع</h3>
          <p className="panel-section-card__subtitle">آخر المشاريع المضافة مع لمحة سريعة عن التحليل.</p>
        </div>

        <Link to={ROUTES.entrepreneur.projects} className="panel-section-card__link">
          عرض الكل
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="panel-empty-box">لا توجد مشاريع حتى الآن.</div>
      ) : (
        <div className="entrepreneur-projects-list">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`${ROUTES.entrepreneur.projects}/${project.id}`}
              className="entrepreneur-project-card"
            >
              <div className="entrepreneur-project-card__top">
                <div>
                  <h4>{project.title}</h4>
                  <span>{project.companyName}</span>
                </div>

                <span className={mapRiskClassName(project.riskLevel)}>
                  {mapRiskLabel(project.riskLevel)}
                </span>
              </div>

              <div className="entrepreneur-project-card__meta">
                <span>الحالة: {mapPublicationStatus(project.publicationStatus)}</span>
                <span>
                  السكور: {project.riskScore !== null ? `${(project.riskScore * 100).toFixed(2)}%` : "غير متوفر"}
                </span>
                <span>الثقة: {project.confidenceLevel ?? "غير متوفر"}</span>
              </div>

              <div className="entrepreneur-project-card__date">
                تاريخ الإضافة: {formatDate(project.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}