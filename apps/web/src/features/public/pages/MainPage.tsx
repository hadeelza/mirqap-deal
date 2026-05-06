import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "../../../core/constants/routes";
import type {
  PublicFeaturedProject,
  PublicTrendPoint,
} from "../../../core/types/public.types";
import {
  getFeaturedPublicProject,
  getPublishedProjectsCount,
  getPublishedProjectsTrend,
} from "../../../lib/supabase/queries/projects.queries";
import { getPublicUserCounts } from "../../../lib/supabase/queries/users.queries";

function formatSar(value: number) {
  return new Intl.NumberFormat("ar-SA").format(Math.round(value));
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function mapRiskLabel(riskLevel: PublicFeaturedProject["riskLevel"]) {
  if (riskLevel === "low") return "منخفضة";
  if (riskLevel === "medium") return "متوسطة";
  if (riskLevel === "high") return "مرتفعة";
  return "غير متاح";
}

function mapRiskClass(riskLevel: PublicFeaturedProject["riskLevel"]) {
  if (riskLevel === "low") return "risk-chip risk-chip--low";
  if (riskLevel === "medium") return "risk-chip risk-chip--medium";
  if (riskLevel === "high") return "risk-chip risk-chip--high";
  return "risk-chip";
}

function mapStageLabel(stage: string) {
  if (stage === "idea") return "مرحلة الفكرة";
  if (stage === "mvp_seed") return "المرحلة A";
  return stage;
}

function mapCustomerFocusLabel(focus: string) {
  if (focus === "b2b") return "B2B";
  if (focus === "b2c") return "B2C";
  if (focus === "b2g") return "B2G";
  if (focus === "marketplace") return "Marketplace";
  return "Other";
}

function HeroChart({ trend }: { trend: PublicTrendPoint[] }) {
  const maxValue = Math.max(...trend.map((item) => item.value), 1);

  return (
    <div className="hero-preview-chart">
      <div className="hero-preview-chart__header">
        <span>نمو الاستثمارات</span>
        <span>هذا العام</span>
      </div>

      <div className="hero-preview-chart__bars">
        {trend.map((item) => {
          const height = Math.max((item.value / maxValue) * 100, 12);

          return (
            <div key={item.label} className="hero-preview-chart__item">
              <div
                className="hero-preview-chart__bar"
                style={{ height: `${height}%` }}
                title={`${item.label}: ${item.value}`}
              />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MainPage() {
  const overviewQuery = useQuery({
    queryKey: ["public-main-overview"],
    queryFn: async () => {
      const [publishedProjectsCount, userCounts] = await Promise.all([
        getPublishedProjectsCount(),
        getPublicUserCounts(),
      ]);

      return {
        publishedProjectsCount,
        investorsCount: userCounts.investorsCount,
        entrepreneursCount: userCounts.entrepreneursCount,
      };
    },
  });

  const featuredProjectQuery = useQuery({
    queryKey: ["public-main-featured-project"],
    queryFn: getFeaturedPublicProject,
  });

  const trendQuery = useQuery({
    queryKey: ["public-main-trend"],
    queryFn: () => getPublishedProjectsTrend(8),
  });

  const featuredProject = featuredProjectQuery.data;
  const trend = trendQuery.data ?? [];
  const overview = overviewQuery.data;

  const isLoading =
    overviewQuery.isLoading || featuredProjectQuery.isLoading || trendQuery.isLoading;

  return (
    <div className="main-page">
      <section className="main-hero">
        <div className="container">
          <div className="main-hero__grid">
            <div className="main-hero__preview">
              <div className="hero-preview-card">
                <div className="hero-preview-card__top">
                  <div className="hero-preview-card__dots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="hero-preview-card__brand">
                    <span>صفقة بمرقاب</span>
                    <i />
                  </div>
                </div>

                <div className="hero-preview-card__headline">
                  <h3>تحويل البيانات إلى رؤى استثمارية</h3>
                  <p>
                    منصة التحليل الذكي التي تساعد في اتخاذ قرارات استثمارية مدروسة.
                  </p>
                </div>

                <div className="hero-preview-card__stats">
                  <div className="hero-mini-stat">
                    <strong>
                      {featuredProject?.riskScore !== null && featuredProject?.riskScore !== undefined
                        ? `${Math.round((featuredProject.riskScore ?? 0) * 100)}%`
                        : "--"}
                    </strong>
                    <span>معدل النجاح</span>
                  </div>

                  <div className="hero-mini-stat">
                    <strong>
                      {featuredProject ? formatCompact(featuredProject.marketSizeM * 1_000_000) : "--"}
                    </strong>
                    <span>الفرصة السوقية</span>
                  </div>

                  <div className="hero-mini-stat">
                    <strong>
                      {featuredProject ? `﷼${formatCompact(featuredProject.capitalSeekingSar)}` : "--"}
                    </strong>
                    <span>رأس المال المستهدف</span>
                  </div>
                </div>

                <HeroChart trend={trend} />

                {featuredProject ? (
                  <div className="hero-preview-card__project">
                    <div className="hero-preview-card__project-top">
                      <strong>{featuredProject.companyName}</strong>
                      <span className={mapRiskClass(featuredProject.riskLevel)}>
                        تصنيف المخاطر: {mapRiskLabel(featuredProject.riskLevel)}
                      </span>
                    </div>

                    <p>{featuredProject.shortPitch}</p>

                    <div className="hero-preview-card__tags">
                      <span>{featuredProject.categoryNameAr}</span>
                      <span>{mapStageLabel(featuredProject.startupStage)}</span>
                      <span>{mapCustomerFocusLabel(featuredProject.customerFocus)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="hero-preview-card__project hero-preview-card__project--empty">
                    لا توجد مشاريع منشورة بعد لعرضها في الواجهة العامة.
                  </div>
                )}
              </div>
            </div>

            <div className="main-hero__content">
              <span className="main-hero__eyebrow">رؤية السعودية 2030 · تقنيات مالية متقدمة</span>
              <h1>صفقة بمرقاب</h1>
              <p>
                منصة الاستثمار الذكية الأولى في المملكة العربية السعودية، تربط
                المستثمرين الملائكة برواد الأعمال من خلال تقنيات الذكاء الاصطناعي
                المتطورة.
              </p>

              <div className="main-hero__actions">
                <Link to={ROUTES.auth.register} className="btn btn--primary">
                  ابدأ الاستثمار
                </Link>
                <Link to={ROUTES.public.about} className="btn btn--ghost">
                  اكتشف
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="main-trust">
        <div className="container">
          <div className="section-heading section-heading--centered">
            <h2>أكبر الشركات تثق في صفقة بمرقاب</h2>
          </div>

          <div className="main-trust__grid">
            <article className="count-card">
              <strong>{overview ? `${overview.publishedProjectsCount}+` : isLoading ? "..." : "0+"}</strong>
              <span>مشروع منشور على المنصة</span>
            </article>

            <article className="count-card">
              <strong>{overview ? `${overview.entrepreneursCount}+` : isLoading ? "..." : "0+"}</strong>
              <span>رائد أعمال نشط</span>
            </article>

            <article className="count-card">
              <strong>{overview ? `${overview.investorsCount}+` : isLoading ? "..." : "0+"}</strong>
              <span>مستثمر ملائكي</span>
            </article>
          </div>
        </div>
      </section>

      <section className="main-how">
        <div className="container">
          <div className="section-heading section-heading--centered">
            <h2>كيف يعمل "صفقة بمرقاب"؟</h2>
            <p>منصة مدعومة بالذكاء الاصطناعي مع توصيات شخصية وتقييمات احترافية للمشاريع</p>
          </div>

          <div className="main-how__grid">
            <article className="steps-card">
              <h3>للمستثمرين</h3>

              <div className="step-item">
                <span>1</span>
                <div>
                  <strong>إنشاء حساب مستثمر</strong>
                  <p>حدد مجال استثماراتك ونطاق التمويل المفضل لديك</p>
                </div>
              </div>

              <div className="step-item">
                <span>2</span>
                <div>
                  <strong>احصل على توصيات ذكية</strong>
                  <p>مساعد الذكاء الاصطناعي يرشح لك المشاريع الأنسب لاهتماماتك</p>
                </div>
              </div>

              <div className="step-item">
                <span>3</span>
                <div>
                  <strong>قدم عروضًا مدروسة</strong>
                  <p>استفد من التقييمات الرقمية والتحليلات الذكية للمشاريع</p>
                </div>
              </div>
            </article>

            <article className="steps-card">
              <h3>لرواد الأعمال</h3>

              <div className="step-item">
                <span>1</span>
                <div>
                  <strong>أنشئ ملفك وأضف مشروعك</strong>
                  <p>قدم خطة عملك والوثائق الأساسية مع التمويل المطلوب</p>
                </div>
              </div>

              <div className="step-item">
                <span>2</span>
                <div>
                  <strong>مراجعة إدارية شاملة</strong>
                  <p>تخضع المشاريع لمراجعة دقيقة لضمان الجودة والمصداقية</p>
                </div>
              </div>

              <div className="step-item">
                <span>3</span>
                <div>
                  <strong>عروض استثمار مؤهلة</strong>
                  <p>تلقى عروضًا من مستثمرين تم التحقق منهم مع إمكانية التفاوض</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="main-safety">
        <div className="container">
          <div className="section-heading section-heading--centered">
            <h2>الأمان والثقة</h2>
            <p>نضمن حماية استثماراتك ومعلوماتك</p>
          </div>

          <div className="main-safety__grid">
            <article className="safety-card">
              <div className="safety-card__icon">◔</div>
              <strong>دعم 24/7</strong>
              <p>فريق دعم متاح على مدار الساعة</p>
            </article>

            <article className="safety-card">
              <div className="safety-card__icon">✓</div>
              <strong>تحقق من الهوية</strong>
              <p>فحص شامل لجميع المستخدمين</p>
            </article>

            <article className="safety-card">
              <div className="safety-card__icon">▣</div>
              <strong>عقود قانونية</strong>
              <p>جميع الاتفاقيات موثقة قانونيًا</p>
            </article>

            <article className="safety-card">
              <div className="safety-card__icon">⛨</div>
              <strong>حماية البيانات</strong>
              <p>تشفير متقدم لحماية جميع البيانات</p>
            </article>
          </div>
        </div>
      </section>

      {featuredProject && (
        <section className="main-highlight">
          <div className="container">
            <div className="highlight-card">
              <div className="highlight-card__content">
                <span className="highlight-card__eyebrow">مشروع منشور من قاعدة البيانات</span>
                <h3>{featuredProject.title}</h3>
                <p>{featuredProject.shortPitch}</p>
              </div>

              <div className="highlight-card__metrics">
                <div>
                  <span>رأس المال المطلوب</span>
                  <strong>{formatSar(featuredProject.capitalSeekingSar)} ريال</strong>
                </div>

                <div>
                  <span>الإيراد الشهري</span>
                  <strong>{formatSar(featuredProject.monthlyRevenueSar)} ريال</strong>
                </div>

                <div>
                  <span>حجم الفريق</span>
                  <strong>{featuredProject.teamSize}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}