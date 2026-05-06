export type SubmitOfferFormValues = {
    offerAmount: string;
    equityPercentage: string;
    expectedReturns: string;
    specialConditions: string;
    message: string;
  };
  
  type SubmitOfferFormProps = {
    values: SubmitOfferFormValues;
    onChange: (values: SubmitOfferFormValues) => void;
    onSubmit: (values: SubmitOfferFormValues) => Promise<void>;
    isSubmitting: boolean;
    errorMessage?: string;
  };
  
  export default function SubmitOfferForm({
    values,
    onChange,
    onSubmit,
    isSubmitting,
    errorMessage,
  }: SubmitOfferFormProps) {
    function updateField<K extends keyof SubmitOfferFormValues>(
      key: K,
      value: SubmitOfferFormValues[K]
    ) {
      onChange({
        ...values,
        [key]: value,
      });
    }
  
    return (
      <form
        className="investor-submit-offer-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(values);
        }}
      >
        <div className="investor-submit-offer-form__card">
          <div className="investor-submit-offer-form__header">
            <h2>تفاصيل العرض</h2>
            <p>أدخل بيانات العرض بطريقة واضحة ومباشرة حتى يسهل على صاحب المشروع مراجعته.</p>
          </div>
  
          <div className="investor-submit-offer-form__grid">
            <div className="investor-form-field">
              <label htmlFor="offer-amount">مبلغ العرض (ر.س)</label>
              <input
                id="offer-amount"
                type="number"
                min="0"
                step="0.01"
                value={values.offerAmount}
                onChange={(event) => updateField("offerAmount", event.target.value)}
                placeholder="مثال: 250000"
              />
            </div>
  
            <div className="investor-form-field">
              <label htmlFor="equity-percentage">نسبة الملكية (%)</label>
              <input
                id="equity-percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={values.equityPercentage}
                onChange={(event) => updateField("equityPercentage", event.target.value)}
                placeholder="مثال: 10"
              />
            </div>
          </div>
  
          <div className="investor-form-field">
            <label htmlFor="expected-returns">العائد المتوقع</label>
            <textarea
              id="expected-returns"
              value={values.expectedReturns}
              onChange={(event) => updateField("expectedReturns", event.target.value)}
              placeholder="اكتب تصورك للعائد المتوقع أو آلية النمو التي تعتمد عليها."
              rows={4}
            />
          </div>
  
          <div className="investor-form-field">
            <label htmlFor="special-conditions">الشروط الخاصة</label>
            <textarea
              id="special-conditions"
              value={values.specialConditions}
              onChange={(event) => updateField("specialConditions", event.target.value)}
              placeholder="أدخل أي شروط إضافية مرتبطة بالعرض إن وجدت."
              rows={4}
            />
          </div>
  
          <div className="investor-form-field">
            <label htmlFor="offer-message">رسالة العرض</label>
            <textarea
              id="offer-message"
              value={values.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="اكتب رسالة مختصرة وواضحة لصاحب المشروع."
              rows={6}
            />
          </div>
  
          {errorMessage ? <div className="investor-form-error">{errorMessage}</div> : null}
  
          <div className="investor-submit-offer-form__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جارٍ إرسال العرض..." : "إرسال العرض"}
            </button>
          </div>
        </div>
      </form>
    );
  }