interface InvestorVisibilityCardProps {
    isDiscoverable: boolean;
  }
  
  export default function InvestorVisibilityCard({
    isDiscoverable,
  }: InvestorVisibilityCardProps) {
    return (
      <article className="investor-visibility-card">
        <div className="investor-visibility-card__header">
          <h2 className="investor-visibility-card__title">إعدادات الاكتشاف</h2>
          <span
            className={
              isDiscoverable
                ? "investor-visibility-card__state investor-visibility-card__state--success"
                : "investor-visibility-card__state investor-visibility-card__state--muted"
            }
          >
            {isDiscoverable ? "قابل للاكتشاف" : "غير قابل للاكتشاف"}
          </span>
        </div>
  
        <div className="investor-visibility-card__grid">
          <div className="investor-visibility-card__item">
            <span className="investor-visibility-card__label">حالة الاكتشاف</span>
            <strong className="investor-visibility-card__value">
              {isDiscoverable ? "مفعل" : "غير مفعل"}
            </strong>
          </div>
        </div>
  
        <div className="investor-visibility-card__note">
          <p>
            هذا الإعداد يحدد إمكانية ظهور الحساب ضمن المطابقة الداخلية، التوصيات، والاستكشاف المرتبط
            بالمشاريع والمستثمرين.
          </p>
        </div>
  
        <div className="investor-visibility-card__tips">
          <h3 className="investor-visibility-card__tips-title">تفاصيل إضافية</h3>
          <ul className="investor-visibility-card__list">
            <li>عند التفعيل يدخل الحساب ضمن منطق المطابقة والتوصيات.</li>
            <li>عند التعطيل لا يتم إدخاله ضمن الاكتشاف الداخلي بشكل موسع.</li>
            <li>الحالة الحالية محفوظة مباشرة من جدول investor_profiles.</li>
          </ul>
        </div>
      </article>
    );
  }