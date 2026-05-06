export type ProjectCategoryOption = {
    id: string;
    nameAr: string;
    nameEn: string;
  };
  
  export type ProjectTechnologyOption = {
    id: string;
    nameAr: string;
    nameEn: string;
  };
  
  export type ProjectFormValues = {
    title: string;
    companyName: string;
    shortPitch: string;
    categoryId: string;
    startupStage: "idea" | "mvp_seed";
    confidenceLevel: "concept" | "prototype" | "mvp" | "early_market";
    customerFocus: "b2b" | "b2c" | "b2g" | "marketplace" | "other";
    teamSize: string;
    founderMotivation: "low" | "medium" | "high";
    marketSizeM: string;
    competitorsCount: string;
    monthlyRevenueSar: string;
    capitalSeekingSar: string;
    postMoneyValuationSar: string;
    fundingStage: "bootstrapped" | "friends_family" | "pre_seed" | "seed";
    problemDescription: string;
    solutionDescription: string;
    differentiation: string;
    traction: string;
    risks: string;
    exitStrategy: string;
    technologyIds: string[];
  };
  
  type ProjectFormProps = {
    values: ProjectFormValues;
    categories: ProjectCategoryOption[];
    technologies: ProjectTechnologyOption[];
    isSubmitting: boolean;
    onChange: (field: keyof Omit<ProjectFormValues, "technologyIds">, value: string) => void;
    onToggleTechnology: (technologyId: string) => void;
    onSaveDraft: () => void;
    onSubmitProject: () => void;
  };
  
  function TechnologyChip({
    label,
    isActive,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        className={isActive ? "project-tech-chip project-tech-chip--active" : "project-tech-chip"}
        onClick={onClick}
      >
        {label}
      </button>
    );
  }
  
  export default function ProjectForm({
    values,
    categories,
    technologies,
    isSubmitting,
    onChange,
    onToggleTechnology,
    onSaveDraft,
    onSubmitProject,
  }: ProjectFormProps) {
    return (
      <section className="project-create-section">
        <div className="project-create-section__header">
          <h3>بيانات المشروع</h3>
          <p>أدخل معلومات المشروع الأساسية والتشغيلية بشكل كامل.</p>
        </div>
  
        <div className="project-create-form-grid">
          <div className="project-field">
            <label>عنوان المشروع</label>
            <input
              value={values.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="مثال: منصة ذكاء مالي للشركات الناشئة"
            />
          </div>
  
          <div className="project-field">
            <label>اسم الشركة</label>
            <input
              value={values.companyName}
              onChange={(event) => onChange("companyName", event.target.value)}
              placeholder="اسم الشركة أو المبادرة"
            />
          </div>
  
          <div className="project-field project-field--full">
            <label>الوصف المختصر</label>
            <textarea
              value={values.shortPitch}
              onChange={(event) => onChange("shortPitch", event.target.value)}
              placeholder="قدّم وصفاً مختصراً واضحاً عن المشروع"
            />
          </div>
  
          <div className="project-field">
            <label>التصنيف</label>
            <select
              value={values.categoryId}
              onChange={(event) => onChange("categoryId", event.target.value)}
            >
              <option value="">اختر التصنيف</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nameAr}
                </option>
              ))}
            </select>
          </div>
  
          <div className="project-field">
            <label>المرحلة</label>
            <select
              value={values.startupStage}
              onChange={(event) => onChange("startupStage", event.target.value)}
            >
              <option value="idea">فكرة</option>
              <option value="mvp_seed">MVP / Seed</option>
            </select>
          </div>
  
          <div className="project-field">
            <label>Confidence Level</label>
            <select
              value={values.confidenceLevel}
              onChange={(event) => onChange("confidenceLevel", event.target.value)}
            >
              <option value="concept">Concept</option>
              <option value="prototype">Prototype</option>
              <option value="mvp">MVP</option>
              <option value="early_market">Early Market</option>
            </select>
          </div>
  
          <div className="project-field">
            <label>Customer Focus</label>
            <select
              value={values.customerFocus}
              onChange={(event) => onChange("customerFocus", event.target.value)}
            >
              <option value="b2b">B2B</option>
              <option value="b2c">B2C</option>
              <option value="b2g">B2G</option>
              <option value="marketplace">Marketplace</option>
              <option value="other">Other</option>
            </select>
          </div>
  
          <div className="project-field">
            <label>حجم الفريق</label>
            <input
              type="number"
              min="1"
              value={values.teamSize}
              onChange={(event) => onChange("teamSize", event.target.value)}
              placeholder="مثال: 4"
            />
          </div>
  
          <div className="project-field">
            <label>Founder Motivation</label>
            <select
              value={values.founderMotivation}
              onChange={(event) => onChange("founderMotivation", event.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
  
          <div className="project-field">
            <label>حجم السوق بالمليون</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.marketSizeM}
              onChange={(event) => onChange("marketSizeM", event.target.value)}
              placeholder="مثال: 18.5"
            />
          </div>
  
          <div className="project-field">
            <label>عدد المنافسين</label>
            <input
              type="number"
              min="0"
              value={values.competitorsCount}
              onChange={(event) => onChange("competitorsCount", event.target.value)}
              placeholder="مثال: 6"
            />
          </div>
  
          <div className="project-field">
            <label>الإيراد الشهري بالريال</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.monthlyRevenueSar}
              onChange={(event) => onChange("monthlyRevenueSar", event.target.value)}
              placeholder="مثال: 25000"
            />
          </div>
  
          <div className="project-field">
            <label>رأس المال المطلوب</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.capitalSeekingSar}
              onChange={(event) => onChange("capitalSeekingSar", event.target.value)}
              placeholder="مثال: 500000"
            />
          </div>
  
          <div className="project-field">
            <label>Post Money Valuation</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.postMoneyValuationSar}
              onChange={(event) => onChange("postMoneyValuationSar", event.target.value)}
              placeholder="مثال: 3000000"
            />
          </div>
  
          <div className="project-field">
            <label>Funding Stage</label>
            <select
              value={values.fundingStage}
              onChange={(event) => onChange("fundingStage", event.target.value)}
            >
              <option value="bootstrapped">Bootstrapped</option>
              <option value="friends_family">Friends & Family</option>
              <option value="pre_seed">Pre-Seed</option>
              <option value="seed">Seed</option>
            </select>
          </div>
  
          <div className="project-field">
            <label>Exit Strategy</label>
            <select
              value={values.exitStrategy}
              onChange={(event) => onChange("exitStrategy", event.target.value)}
            >
              <option value="Acquisition">Acquisition</option>
              <option value="IPO">IPO</option>
              <option value="Merger">Merger</option>
              <option value="Strategic Partnership">Strategic Partnership</option>
              <option value="Profitability">Profitability</option>
            </select>
          </div>
  
          <div className="project-field project-field--full">
            <label>التقنيات المستخدمة</label>
            <div className="project-tech-grid">
              {technologies.map((item) => (
                <TechnologyChip
                  key={item.id}
                  label={item.nameAr}
                  isActive={values.technologyIds.includes(item.id)}
                  onClick={() => onToggleTechnology(item.id)}
                />
              ))}
            </div>
          </div>
  
          <div className="project-field project-field--full">
            <label>وصف المشكلة</label>
            <textarea
              value={values.problemDescription}
              onChange={(event) => onChange("problemDescription", event.target.value)}
            />
          </div>
  
          <div className="project-field project-field--full">
            <label>وصف الحل</label>
            <textarea
              value={values.solutionDescription}
              onChange={(event) => onChange("solutionDescription", event.target.value)}
            />
          </div>
  
          <div className="project-field project-field--full">
            <label>عوامل التميّز</label>
            <textarea
              value={values.differentiation}
              onChange={(event) => onChange("differentiation", event.target.value)}
            />
          </div>
  
          <div className="project-field project-field--full">
            <label>Traction</label>
            <textarea
              value={values.traction}
              onChange={(event) => onChange("traction", event.target.value)}
            />
          </div>
  
          <div className="project-field project-field--full">
            <label>المخاطر</label>
            <textarea
              value={values.risks}
              onChange={(event) => onChange("risks", event.target.value)}
            />
          </div>
        </div>
  
        <div className="project-create-actions">
          <button
            type="button"
            className="project-create-btn project-create-btn--secondary"
            onClick={onSaveDraft}
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ كمسودة"}
          </button>
  
          <button
            type="button"
            className="project-create-btn project-create-btn--primary"
            onClick={onSubmitProject}
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال للمراجعة"}
          </button>
        </div>
      </section>
    );
  }