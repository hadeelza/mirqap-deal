export default function ExploreProjectsPage() {
    return (
      <section className="investor-page">
        <div className="investor-page__hero">
          <span className="investor-page__eyebrow">Explore Projects</span>
          <h2>استكشاف المشاريع</h2>
          <p>هذه الصفحة ستعرض المشاريع المعتمدة والمنشورة مع الفلاتر والبحث والترتيب والتوافق مع التفضيلات.</p>
        </div>
  
        <div className="investor-placeholder-grid">
          <div className="investor-placeholder-card">
            <h3>قائمة المشاريع</h3>
            <p>عرض المشاريع الجاهزة للاستكشاف للمستثمر.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>الفلاتر والبحث</h3>
            <p>فلاتر الفئة والمرحلة والمخاطر والتقنيات وغيرها.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>الذكاء المساعد</h3>
            <p>سيظهر هنا ملخص AI ودرجة الخطورة والمؤشرات المهمة.</p>
          </div>
        </div>
      </section>
    );
  }