export type SimulationFormValues = {
    teamSize: string;
    monthlyRevenue: string;
    fundingStage: string;
    capitalSeeking: string;
    postMoneyValuation: string;
  };
  
  type SimulationInputFormProps = {
    values: SimulationFormValues;
    isSubmitting: boolean;
    onChange: <K extends keyof SimulationFormValues>(field: K, value: SimulationFormValues[K]) => void;
    onSubmit: () => Promise<void>;
  };
  
  export default function SimulationInputForm({
    values,
    isSubmitting,
    onChange,
    onSubmit,
  }: SimulationInputFormProps) {
    return (
      <section className="entrepreneur-ai-card">
        <div className="entrepreneur-ai-card__header">
          <h2>مدخلات المحاكاة</h2>
        </div>
  
        <form
          className="entrepreneur-simulation-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
        >
          <div className="entrepreneur-simulation-form__grid">
            <div className="entrepreneur-form-field">
              <label>حجم الفريق</label>
              <input
                type="number"
                min="1"
                value={values.teamSize}
                onChange={(event) => onChange("teamSize", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>الإيراد الشهري</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.monthlyRevenue}
                onChange={(event) => onChange("monthlyRevenue", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>مرحلة التمويل</label>
              <select
                value={values.fundingStage}
                onChange={(event) => onChange("fundingStage", event.target.value)}
              >
                <option value="bootstrapped">تمويل ذاتي</option>
                <option value="friends_family">أصدقاء وعائلة</option>
                <option value="pre_seed">Pre-Seed</option>
                <option value="seed">Seed</option>
              </select>
            </div>
  
            <div className="entrepreneur-form-field">
              <label>رأس المال المطلوب</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.capitalSeeking}
                onChange={(event) => onChange("capitalSeeking", event.target.value)}
              />
            </div>
  
            <div className="entrepreneur-form-field">
              <label>التقييم بعد الاستثمار</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.postMoneyValuation}
                onChange={(event) => onChange("postMoneyValuation", event.target.value)}
              />
            </div>
          </div>
  
          <div className="entrepreneur-form-actions">
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "جارٍ تنفيذ المحاكاة..." : "تشغيل المحاكاة"}
            </button>
          </div>
        </form>
      </section>
    );
  }