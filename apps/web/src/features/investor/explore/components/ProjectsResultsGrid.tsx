import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import InvestorProjectCard, { type ExploreProjectCardData } from "./InvestorProjectCard";

interface ProjectsResultsGridProps {
  projects: ExploreProjectCardData[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function ProjectsResultsGrid({
  projects,
  hasMore,
  onLoadMore,
}: ProjectsResultsGridProps) {
  if (projects.length === 0) {
    return (
      <section className="investor-explore-empty">
        <h3 className="investor-explore-empty__title">لا توجد مشاريع مطابقة حالياً</h3>
        <p className="investor-explore-empty__text">
          جرّب تعديل الفلاتر أو تحديث تفضيلاتك الاستثمارية للحصول على نتائج أقرب لاهتماماتك.
        </p>

        <div className="investor-explore-empty__actions">
          <Link to={ROUTES.investor.preferences} className="btn btn--ghost">
            تعديل التفضيلات
          </Link>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="investor-explore-results">
      <div className="investor-explore-results__grid">
        {projects.map((project: ExploreProjectCardData) => (
          <InvestorProjectCard key={project.projectId} project={project} />
        ))}
      </div>

      {hasMore ? (
        <div className="investor-explore-results__footer">
          <button type="button" className="btn btn--primary" onClick={onLoadMore}>
            عرض المزيد
          </button>
        </div>
      ) : null}
    </section>
  );
}