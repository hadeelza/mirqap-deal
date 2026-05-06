type StartupStage = "idea" | "mvp_seed";
type ConfidenceLevel = "concept" | "prototype" | "mvp" | "early_market";
type RiskLevel = "low" | "medium" | "high";
type CustomerFocus = "b2b" | "b2c" | "b2g" | "marketplace" | "other";
type InvestmentStatus = "open" | "in_negotiation" | "funded" | "closed";
type FundingStage = "bootstrapped" | "friends_family" | "pre_seed" | "seed";

interface CategoryOption {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

interface TechnologyOption {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

interface ExploreFiltersState {
  search: string;
  categoryId: string;
  startupStage: string;
  confidenceLevel: string;
  riskLevel: string;
  customerFocus: string;
  technologyId: string;
  investmentStatus: string;
  fundingStage: string;
}

interface ProjectsFiltersPanelProps {
  categories: CategoryOption[];
  technologies: TechnologyOption[];
  filters: ExploreFiltersState;
  onChange: (key: keyof ExploreFiltersState, value: string) => void;
  onReset: () => void;
}

export default function ProjectsFiltersPanel({
  categories,
  technologies,
  filters,
  onChange,
  onReset,
}: ProjectsFiltersPanelProps) {
  return (
    <section className="investor-explore-filters">
      <div className="investor-explore-filters__header">
        <div>
          <h2 className="investor-explore-filters__title">الفلاتر</h2>
          <p className="investor-explore-filters__subtitle">
            خصص النتائج بحسب ما يناسب توجهك الاستثماري.
          </p>
        </div>

        <button type="button" className="btn btn--ghost" onClick={onReset}>
          إعادة ضبط
        </button>
      </div>

      <div className="investor-explore-filters__grid">
        <div className="investor-explore-filter-field">
          <label>القطاع</label>
          <select
            value={filters.categoryId}
            onChange={(event) => onChange("categoryId", event.target.value)}
          >
            <option value="">الكل</option>
            {categories.map((item: CategoryOption) => (
              <option key={item.id} value={item.id}>
                {item.name_ar}
              </option>
            ))}
          </select>
        </div>

        <div className="investor-explore-filter-field">
          <label>مرحلة المشروع</label>
          <select
            value={filters.startupStage}
            onChange={(event) => onChange("startupStage", event.target.value)}
          >
            <option value="">الكل</option>
            <option value={"idea" satisfies StartupStage}>Idea</option>
            <option value={"mvp_seed" satisfies StartupStage}>MVP / Seed</option>
          </select>
        </div>

        <div className="investor-explore-filter-field">
          <label>مستوى الثقة</label>
          <select
            value={filters.confidenceLevel}
            onChange={(event) => onChange("confidenceLevel", event.target.value)}
          >
            <option value="">الكل</option>
            <option value={"concept" satisfies ConfidenceLevel}>Concept</option>
            <option value={"prototype" satisfies ConfidenceLevel}>Prototype</option>
            <option value={"mvp" satisfies ConfidenceLevel}>MVP</option>
            <option value={"early_market" satisfies ConfidenceLevel}>Early Market</option>
          </select>
        </div>

        <div className="investor-explore-filter-field">
          <label>مستوى المخاطرة</label>
          <select
            value={filters.riskLevel}
            onChange={(event) => onChange("riskLevel", event.target.value)}
          >
            <option value="">الكل</option>
            <option value={"low" satisfies RiskLevel}>Low Risk</option>
            <option value={"medium" satisfies RiskLevel}>Medium Risk</option>
            <option value={"high" satisfies RiskLevel}>High Risk</option>
          </select>
        </div>

        <div className="investor-explore-filter-field">
          <label>نوع العميل</label>
          <select
            value={filters.customerFocus}
            onChange={(event) => onChange("customerFocus", event.target.value)}
          >
            <option value="">الكل</option>
            <option value={"b2b" satisfies CustomerFocus}>B2B</option>
            <option value={"b2c" satisfies CustomerFocus}>B2C</option>
            <option value={"b2g" satisfies CustomerFocus}>B2G</option>
            <option value={"marketplace" satisfies CustomerFocus}>Marketplace</option>
            <option value={"other" satisfies CustomerFocus}>Other</option>
          </select>
        </div>

        <div className="investor-explore-filter-field">
          <label>التقنية</label>
          <select
            value={filters.technologyId}
            onChange={(event) => onChange("technologyId", event.target.value)}
          >
            <option value="">الكل</option>
            {technologies.map((item: TechnologyOption) => (
              <option key={item.id} value={item.id}>
                {item.name_ar}
              </option>
            ))}
          </select>
        </div>

        <div className="investor-explore-filter-field">
          <label>حالة الاستثمار</label>
          <select
            value={filters.investmentStatus}
            onChange={(event) => onChange("investmentStatus", event.target.value)}
          >
            <option value="">الكل</option>
            <option value={"open" satisfies InvestmentStatus}>Open</option>
            <option value={"in_negotiation" satisfies InvestmentStatus}>In Negotiation</option>
            <option value={"funded" satisfies InvestmentStatus}>Funded</option>
            <option value={"closed" satisfies InvestmentStatus}>Closed</option>
          </select>
        </div>

        <div className="investor-explore-filter-field">
          <label>مرحلة التمويل</label>
          <select
            value={filters.fundingStage}
            onChange={(event) => onChange("fundingStage", event.target.value)}
          >
            <option value="">الكل</option>
            <option value={"bootstrapped" satisfies FundingStage}>Bootstrapped</option>
            <option value={"friends_family" satisfies FundingStage}>Friends & Family</option>
            <option value={"pre_seed" satisfies FundingStage}>Pre-Seed</option>
            <option value={"seed" satisfies FundingStage}>Seed</option>
          </select>
        </div>
      </div>
    </section>
  );
}