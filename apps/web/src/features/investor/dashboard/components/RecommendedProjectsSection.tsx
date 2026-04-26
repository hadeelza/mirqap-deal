import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";

type RecommendedProject = {
  id: string;
  title: string;
  companyName: string;
  shortPitch: string;
  aiSummary: string;
  riskLevel: string;
  riskScore: number | null;
  capitalSeekingSar: number | null;
  investmentStatus: string;
  matchScore: number;
  matchReasons: string[];
  createdAt: string | null;
};

type RecommendedProjectsSectionProps = {
  isLoading?: boolean;
  hasPreferences: boolean;
  projects: RecommendedProject[];
};

function formatMoney(value: number | null) {
  if (value === null) {
    return "غير محدد";
  }

  return `${new Intl.NumberFormat("ar-SA").format(value)} ر.س`;
}

function getRiskClass(riskLevel: string) {
  if (riskLevel === "low") {
    return "investor-risk-badge investor-risk-badge--low";
  }

  if (riskLevel === "medium") {
    return "investor-risk-badge investor-risk-badge--medium";
  }

  if (riskLevel === "high") {
    return "investor-risk-badge investor-risk-badge--high";
  }

  return "investor-risk-badge";
}

function getRiskLabel(riskLevel: string) {
  if (riskLevel === "low") {
    return "مخاطرة منخفضة";
  }

  if (riskLevel === "medium") {
    return "مخاطرة متوسطة";
  }

  if (riskLevel === "high") {
    return "مخاطرة مرتفعة";
  }

  return "غير محدد";
}

function formatRiskScore(value: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (value <= 1) {
    return `${Math.round(value * 100)}%`;
  }

  return String(value);
}

export default function RecommendedProjectsSection({
  isLoading = false,
  hasPreferences,
  projects,
}: RecommendedProjectsSectionProps) {
  return (
    <section className="investor-dashboard-card">
      <div className="investor-dashboard-card__header">
        <div>
          <h2>المشاريع الموصى بها</h2>
          <p>
            المشاريع هنا مرتبة حسب قربها من تفضيلاتك، مستوى المخاطرة، والتفاعل السابق داخل
            المنصة.
          </p>
        </div>

        <Link to={ROUTES.investor.explore} className="investor-dashboard-card__link">
          عرض الكل
        </Link>
      </div>

      {isLoading ? (
        <div className="investor-projects-list">
          <div className="investor-project-card investor-project-card--loading" />
          <div className="investor-project-card investor-project-card--loading" />
          <div className="investor-project-card investor-project-card--loading" />
        </div>
      ) : null}

      {!isLoading && projects.length === 0 ? (
        <div className="investor-dashboard-empty">
          <h3>لا توجد توصيات جاهزة الآن</h3>
          <p>
            {hasPreferences
              ? "لم نعثر حالياً على مشاريع مطابقة بشكل كافٍ لتفضيلاتك. جرّب تعديل التفضيلات أو استكشاف المزيد من المشاريع."
              : "لم يتم إعداد تفضيلات المستثمر بعد، لذلك لم نستطع بناء توصيات مخصصة بشكل أفضل."}
          </p>

          <div className="investor-dashboard-empty__actions">
            <Link to={ROUTES.investor.preferences} className="btn btn--primary">
              تعديل التفضيلات
            </Link>
            <Link to={ROUTES.investor.explore} className="btn btn--ghost">
              استكشاف المشاريع
            </Link>
          </div>
        </div>
      ) : null}

      {!isLoading && projects.length > 0 ? (
        <div className="investor-projects-list">
          {projects.map((project) => (
            <article key={project.id} className="investor-project-card">
              <div className="investor-project-card__top">
                <div>
                  <h3>{project.title}</h3>
                  <span>{project.companyName}</span>
                </div>

                <div className="investor-project-card__meta">
                  <span className="investor-project-card__score">
                    درجة المطابقة {project.matchScore}
                  </span>
                  <span className={getRiskClass(project.riskLevel)}>
                    {getRiskLabel(project.riskLevel)}
                  </span>
                </div>
              </div>

              <p className="investor-project-card__pitch">{project.shortPitch}</p>

              <div className="investor-project-card__summary">
                <strong>الملخص الذكي</strong>
                <p>{project.aiSummary}</p>
              </div>

              <div className="investor-project-card__stats">
                <div>
                  <span>رأس المال المطلوب</span>
                  <strong>{formatMoney(project.capitalSeekingSar)}</strong>
                </div>

                <div>
                  <span>مؤشر المخاطرة</span>
                  <strong>{formatRiskScore(project.riskScore)}</strong>
                </div>

                <div>
                  <span>حالة الاستثمار</span>
                  <strong>{project.investmentStatus}</strong>
                </div>
              </div>

              <div className="investor-project-card__reasons">
                {project.matchReasons.map((reason) => (
                  <span key={reason} className="investor-project-card__reason">
                    {reason}
                  </span>
                ))}
              </div>

              <div className="investor-project-card__actions">
                <Link to={`${ROUTES.investor.explore}/${project.id}`} className="btn btn--primary">
                  عرض التفاصيل
                </Link>
                <Link to={ROUTES.investor.explore} className="btn btn--ghost">
                  الذهاب للاستكشاف
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}