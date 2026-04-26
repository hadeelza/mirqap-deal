export default function InvestorDealsPage() {
    return (
      <section className="investor-page">
        <div className="investor-page__hero">
          <span className="investor-page__eyebrow">Deals</span>
          <h2>الصفقات</h2>
          <p>هذه الصفحة ستعرض الصفقات المفتوحة والمغلقة وتفاصيل التواصل والحالة الزمنية للاتفاق.</p>
        </div>
  
        <div className="investor-placeholder-grid">
          <div className="investor-placeholder-card">
            <h3>الصفقات الحالية</h3>
            <p>عرض الصفقات الجارية وحالتها الحالية.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>الخط الزمني</h3>
            <p>متابعة تاريخ إنشاء الصفقة ومشاركة معلومات التواصل والإغلاق.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>سجل الصفقة</h3>
            <p>ربط الصفقة بالمشروع والعرض الاستثماري المرتبط بها.</p>
          </div>
        </div>
      </section>
    );
  }