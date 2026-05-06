export default function FeaturesSection() {
    return (
      <section className="public-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-chip section-chip--soft">مزايا المنصة</span>
            <h2>لماذا صفقة بمرقاب؟</h2>
            <p>
              المنصة لا تركز فقط على الشكل، بل على ترتيب البيانات وتسهيل الوصول إلى
              الفرص المناسبة.
            </p>
          </div>
  
          <div className="feature-grid">
            <article className="feature-card">
              <h3>عرض منظم للمشاريع</h3>
              <p>كل مشروع يظهر ببيانات مرتبة تساعد على فهمه بسرعة ووضوح.</p>
            </article>
  
            <article className="feature-card">
              <h3>اكتشاف أسهل للفرص</h3>
              <p>تصفح المشاريع المنشورة يصبح أبسط وأكثر مناسبة للمستثمر.</p>
            </article>
  
            <article className="feature-card">
              <h3>هيكل جاهز للتوسع</h3>
              <p>البنية تدعم العروض، الرسائل، التنبيهات، والتحليل الذكي لاحقًا.</p>
            </article>
  
            <article className="feature-card">
              <h3>واجهة عربية حديثة</h3>
              <p>التصميم مبني من البداية ليتوافق مع تجربة عربية واضحة ومريحة.</p>
            </article>
          </div>
        </div>
      </section>
    );
  }