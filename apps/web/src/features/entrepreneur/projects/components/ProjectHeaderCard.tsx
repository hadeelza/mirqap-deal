import { Link } from "react-router-dom";
import type { EntrepreneurProjectDetailsData } from "./project-details.types";

type ProjectHeaderCardProps = {
  project: EntrepreneurProjectDetailsData;
};

function formatStatus(value: string) {
  switch (value) {
    case "draft":
      return "مسودة";
    case "submitted":
      return "تم الإرسال";
    case "under_review":
      return "قيد المراجعة";
    case "approved":
      return "معتمد";
    case "rejected":
      return "مرفوض";
    case "changes_requested":
      return "مطلوب تعديل";
    case "private":
      return "خاص";
    case "published":
      return "منشور";
    case "hidden":
      return "مخفي";
    case "archived":
      return "مؤرشف";
    case "open":
      return "مفتوح";
    case "in_negotiation":
      return "تحت التفاوض";
    case "funded":
      return "تم التمويل";
    case "closed":
      return "مغلق";
    default:
      return value;
  }
}

export default function ProjectHeaderCard({ project }: ProjectHeaderCardProps) {
  return (
    <section className="entrepreneur-detail-card entrepreneur-detail-card--hero">
      <div className="entrepreneur-detail-card__hero-top">
        <div>
          <span className="entrepreneur-detail-card__eyebrow">{project.categoryName}</span>
          <h1 className="entrepreneur-detail-card__title">{project.title}</h1>
          <p className="entrepreneur-detail-card__subtitle">
            {project.companyName?.trim() || "بدون اسم جهة"} —{" "}
            {project.shortPitch?.trim() || "لا يوجد وصف مختصر."}
          </p>
        </div>

        <div className="entrepreneur-detail-card__hero-actions">
          <Link to="/entrepreneur/projects" className="btn btn--ghost">
            العودة إلى مشاريعي
          </Link>
          <Link to={`/entrepreneur/projects/${project.id}/edit`} className="btn btn--ghost">
            تعديل المشروع
          </Link>
          <Link to={`/entrepreneur/projects/${project.id}/evaluation`} className="btn btn--primary">
            صفحة التقييم
          </Link>
          <Link to={`/entrepreneur/projects/${project.id}/simulation`} className="btn btn--ghost">
            المحاكاة
          </Link>
          <Link to={`/entrepreneur/browse-investors?projectId=${project.id}`} className="btn btn--ghost">
            تصفح المستثمرين
          </Link>
        </div>
      </div>

      <div className="entrepreneur-detail-card__chips">
        <span className="status-chip status-chip--slate">{formatStatus(project.approvalStatus)}</span>
        <span className="status-chip status-chip--blue">{formatStatus(project.publicationStatus)}</span>
        <span className="status-chip status-chip--gold">{formatStatus(project.investmentStatus)}</span>
      </div>
    </section>
  );
}