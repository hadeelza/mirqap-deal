export default function InvestorPreferencesPage() {
    return (
      <section className="investor-page">
        <div className="investor-page__hero">
          <span className="investor-page__eyebrow">Preferences</span>
          <h2>التفضيلات الاستثمارية</h2>
          <p>هذه الصفحة ستكون مخصصة للفئات والمراحل والمخاطر والتقنيات ومدى التذكرة الاستثمارية.</p>
        </div>
  
        <div className="investor-placeholder-grid">
          <div className="investor-placeholder-card">
            <h3>الفئات والمراحل</h3>
            <p>ربط المستثمر بالقطاعات والمراحل التي يهتم بها.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>المخاطر والتقنيات</h3>
            <p>اختيار مستوى المخاطرة والتقنيات المفضلة.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>المدى الاستثماري</h3>
            <p>الحد الأدنى والحد الأعلى لقيمة الاستثمار.</p>
          </div>
        </div>
      </section>
    );
  }