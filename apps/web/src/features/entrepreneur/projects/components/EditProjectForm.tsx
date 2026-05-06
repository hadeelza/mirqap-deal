type CategoryOption = {
    id: string;
    label: string;
  };
  
  type TechnologyOption = {
    id: string;
    label: string;
  };
  
  export type EditProjectFormValues = {
    title: string;
    companyName: string;
    shortPitch: string;
    categoryId: string;
    startupStage: string;
    confidenceLevel: string;
    customerFocus: string;
    teamSize: string;
    founderMotivation: string;
    marketSizeM: string;
    competitorsCount: string;
    monthlyRevenueSar: string;
    capitalSeekingSar: string;
    postMoneyValuationSar: string;
    fundingStage: string;
    problemDescription: string;
    solutionDescription: string;
    differentiation: string;
    traction: string;
    risks: string;
    exitStrategy: string;
    selectedTechnologyIds: string[];
  };
  
  type EditProjectFormProps = {
    values: EditProjectFormValues;
    categories: CategoryOption[];
    technologies: TechnologyOption[];
    isSubmitting: boolean;
    onChange: <K extends keyof EditProjectFormValues>(field: K, value: EditProjectFormValues[K]) => void;
    onToggleTechnology: (technologyId: string) => void;
    onSave: () => Promise<void>;
    onSaveAndAnalyze: () => Promise<void>;
    onSaveAndResubmit: () => Promise<void>;
  };
  
  function textareaRows(field: string) {
    if (field === "shortPitch") {
      return 3;
    }
  
    return 5;
  }
  
  export default function EditProjectForm({
    values,
    categories,
    technologies,
    isSubmitting,
    onChange,
    onToggleTechnology,
    onSave,
    onSaveAndAnalyze,
    onSaveAndResubmit,
  }: EditProjectFormProps) {
    return (
      <section className="entrepreneur-detail-card">
        <div className="entrepreneur-section-heading">
          <h2>تعديل بيانات المشروع</h2>
        </div>
  
        <form
          className="entrepreneur-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave();
          }}
        >
          <div className="entrepreneur-form-grid">
            <div className="entrepreneur-form-field">
              <label>عنوان المشروع</label>
              <input
                value={values.title}
                onChange={(event) => onChange("title", event.target.value)}
                required
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>اسم الجهة أو الشركة</label>
              <input
                value={values.companyName}
                onChange={(event) => onChange("companyName", event.target.value)}
                required
              />
            </div>
  
            <div className="entrepreneur-form-field entrepreneur-form-field--full">
              <label>وصف مختصر</label>
              <textarea
                rows={textareaRows("shortPitch")}
                value={values.shortPitch}
                onChange={(event) => onChange("shortPitch", event.target.value)}
                required
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>التصنيف</label>
              <select
                value={values.categoryId}
                onChange={(event) => onChange("categoryId", event.target.value)}
                required
              >
                <option value="">اختر التصنيف</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="entrepreneur-form-field">
              <label>المرحلة</label>
              <select
                value={values.startupStage}
                onChange={(event) => onChange("startupStage", event.target.value)}
                required
              >
                <option value="idea">فكرة</option>
                <option value="mvp_seed">بذرة / MVP</option>
              </select>
            </div>
  
            <div className="entrepreneur-form-field">
              <label>مستوى الثقة</label>
              <select
                value={values.confidenceLevel}
                onChange={(event) => onChange("confidenceLevel", event.target.value)}
                required
              >
                <option value="concept">مفهوم</option>
                <option value="prototype">نموذج أولي</option>
                <option value="mvp">MVP</option>
                <option value="early_market">سوق مبكر</option>
              </select>
            </div>
  
            <div className="entrepreneur-form-field">
              <label>تركيز العملاء</label>
              <select
                value={values.customerFocus}
                onChange={(event) => onChange("customerFocus", event.target.value)}
                required
              >
                <option value="b2b">B2B</option>
                <option value="b2c">B2C</option>
                <option value="b2g">B2G</option>
                <option value="marketplace">Marketplace</option>
                <option value="other">أخرى</option>
              </select>
            </div>
  
            <div className="entrepreneur-form-field">
              <label>حجم الفريق</label>
              <input
                type="number"
                min="1"
                value={values.teamSize}
                onChange={(event) => onChange("teamSize", event.target.value)}
                required
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>دافع المؤسس</label>
              <select
                value={values.founderMotivation}
                onChange={(event) => onChange("founderMotivation", event.target.value)}
                required
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">مرتفع</option>
              </select>
            </div>
  
            <div className="entrepreneur-form-field">
              <label>حجم السوق بالمليون</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.marketSizeM}
                onChange={(event) => onChange("marketSizeM", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>عدد المنافسين</label>
              <input
                type="number"
                min="0"
                value={values.competitorsCount}
                onChange={(event) => onChange("competitorsCount", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>الإيراد الشهري</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.monthlyRevenueSar}
                onChange={(event) => onChange("monthlyRevenueSar", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>رأس المال المطلوب</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.capitalSeekingSar}
                onChange={(event) => onChange("capitalSeekingSar", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>التقييم بعد الاستثمار</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.postMoneyValuationSar}
                onChange={(event) => onChange("postMoneyValuationSar", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>مرحلة التمويل</label>
              <select
                value={values.fundingStage}
                onChange={(event) => onChange("fundingStage", event.target.value)}
                required
              >
                <option value="bootstrapped">تمويل ذاتي</option>
                <option value="friends_family">أصدقاء وعائلة</option>
                <option value="pre_seed">Pre-Seed</option>
                <option value="seed">Seed</option>
              </select>
            </div>
          </div>
  
          <div className="entrepreneur-form-field entrepreneur-form-field--full">
            <label>التقنيات</label>
            <div className="entrepreneur-tech-grid">
              {technologies.map((technology) => {
                const selected = values.selectedTechnologyIds.includes(technology.id);
  
                return (
                  <button
                    key={technology.id}
                    type="button"
                    className={selected ? "entrepreneur-tech-chip entrepreneur-tech-chip--active" : "entrepreneur-tech-chip"}
                    onClick={() => onToggleTechnology(technology.id)}
                  >
                    {technology.label}
                  </button>
                );
              })}
            </div>
          </div>
  
          <div className="entrepreneur-form-grid">
            <div className="entrepreneur-form-field entrepreneur-form-field--full">
              <label>المشكلة</label>
              <textarea
                rows={5}
                value={values.problemDescription}
                onChange={(event) => onChange("problemDescription", event.target.value)}
                required
              />
            </div>
  
            <div className="entrepreneur-form-field entrepreneur-form-field--full">
              <label>الحل</label>
              <textarea
                rows={5}
                value={values.solutionDescription}
                onChange={(event) => onChange("solutionDescription", event.target.value)}
                required
              />
            </div>
  
            <div className="entrepreneur-form-field entrepreneur-form-field--full">
              <label>التميّز</label>
              <textarea
                rows={5}
                value={values.differentiation}
                onChange={(event) => onChange("differentiation", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field entrepreneur-form-field--full">
              <label>الـ Traction</label>
              <textarea
                rows={5}
                value={values.traction}
                onChange={(event) => onChange("traction", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field entrepreneur-form-field--full">
              <label>المخاطر</label>
              <textarea
                rows={5}
                value={values.risks}
                onChange={(event) => onChange("risks", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field entrepreneur-form-field--full">
              <label>استراتيجية الخروج</label>
              <textarea
                rows={4}
                value={values.exitStrategy}
                onChange={(event) => onChange("exitStrategy", event.target.value)}
              />
            </div>
          </div>
  
          <div className="entrepreneur-form-actions">
            <button type="submit" className="btn btn--ghost" disabled={isSubmitting}>
              {isSubmitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </button>
  
            <button
              type="button"
              className="btn btn--primary"
              disabled={isSubmitting}
              onClick={() => void onSaveAndAnalyze()}
            >
              {isSubmitting ? "جارٍ التنفيذ..." : "حفظ وإعادة التحليل"}
            </button>
  
            <button
              type="button"
              className="btn btn--primary btn--secondary"
              disabled={isSubmitting}
              onClick={() => void onSaveAndResubmit()}
            >
              {isSubmitting ? "جارٍ التنفيذ..." : "حفظ وإرسال للمراجعة"}
            </button>
          </div>
        </form>
      </section>
    );
  }