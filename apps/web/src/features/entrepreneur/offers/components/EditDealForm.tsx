export type EditDealFormValues = {
  status: string;
  contactSharedAt: string;
  closeNote: string;
};

type EditDealFormProps = {
  dealId: string;
  offerId: string;
  projectTitle: string;
  investorName: string;
  values: EditDealFormValues;
  isSubmitting: boolean;
  onChange: <K extends keyof EditDealFormValues>(field: K, value: EditDealFormValues[K]) => void;
  onSave: () => Promise<void>;
  onCloseDeal: () => Promise<void>;
  onCancelDeal: () => Promise<void>;
};

function formatStatus(value: string) {
  switch (value) {
    case "open":
      return "مفتوحة";
    case "in_progress":
      return "قيد التنفيذ";
    case "contact_shared":
      return "تم تبادل التواصل";
    case "closed":
      return "مغلقة";
    case "cancelled":
      return "ملغية";
    default:
      return value;
  }
}

export default function EditDealForm({
  dealId,
  offerId,
  projectTitle,
  investorName,
  values,
  isSubmitting,
  onChange,
  onSave,
  onCloseDeal,
  onCancelDeal,
}: EditDealFormProps) {
  return (
    <section className="entrepreneur-detail-card">
      <div className="entrepreneur-section-heading">
        <h2>إدارة الصفقة</h2>
      </div>

      <div className="entrepreneur-deal-editor__summary">
        <div className="entrepreneur-deal-editor__summary-item">
          <span>رقم الصفقة</span>
          <strong>{dealId}</strong>
        </div>

        <div className="entrepreneur-deal-editor__summary-item">
          <span>رقم العرض</span>
          <strong>{offerId}</strong>
        </div>

        <div className="entrepreneur-deal-editor__summary-item">
          <span>المشروع</span>
          <strong>{projectTitle}</strong>
        </div>

        <div className="entrepreneur-deal-editor__summary-item">
          <span>المستثمر</span>
          <strong>{investorName}</strong>
        </div>
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
            <label htmlFor="deal-status">حالة الصفقة</label>
            <select
              id="deal-status"
              value={values.status}
              onChange={(event) => onChange("status", event.target.value)}
            >
              <option value="open">مفتوحة</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="contact_shared">تم تبادل التواصل</option>
              <option value="closed">مغلقة</option>
              <option value="cancelled">ملغية</option>
            </select>
          </div>

          <div className="entrepreneur-form-field">
            <label htmlFor="deal-contact-date">تاريخ تبادل التواصل</label>
            <input
              id="deal-contact-date"
              type="datetime-local"
              value={values.contactSharedAt}
              onChange={(event) => onChange("contactSharedAt", event.target.value)}
            />
          </div>

          <div className="entrepreneur-form-field entrepreneur-form-field--full">
            <label htmlFor="deal-close-note">ملاحظة الإغلاق / الإلغاء</label>
            <textarea
              id="deal-close-note"
              rows={5}
              value={values.closeNote}
              onChange={(event) => onChange("closeNote", event.target.value)}
              placeholder="اكتب ملاحظة توضح سبب الإغلاق أو الإلغاء أو أي ملاحظات إضافية"
            />
          </div>
        </div>

        <div className="entrepreneur-deal-editor__status-preview">
          <span>الحالة الحالية المختارة:</span>
          <strong>{formatStatus(values.status)}</strong>
        </div>

        <div className="entrepreneur-form-actions">
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>

          <button
            type="button"
            className="btn btn--ghost"
            disabled={isSubmitting}
            onClick={() => void onCloseDeal()}
          >
            {isSubmitting ? "جارٍ التنفيذ..." : "إغلاق الصفقة"}
          </button>

          <button
            type="button"
            className="btn btn--danger"
            disabled={isSubmitting}
            onClick={() => void onCancelDeal()}
          >
            {isSubmitting ? "جارٍ التنفيذ..." : "إلغاء الصفقة"}
          </button>
        </div>
      </form>
    </section>
  );
}