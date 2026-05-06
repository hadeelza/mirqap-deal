export default function AboutPage() {
  return (
    <div className="content-page">
      <div className="container">
        <div className="section-heading">
          <span className="section-chip">من نحن</span>
          <h1 className="page-title">عن صفقة بمرقاب</h1>
          <p className="page-subtitle">
            صفقة بمرقاب منصة عربية تهدف إلى ربط المستثمرين برواد الأعمال من خلال عرض
            رقمي منظم للمشاريع والفرص.
          </p>
        </div>

        <div className="content-grid">
          <article className="content-card">
            <h3>فكرة المنصة</h3>
            <p>
              تقوم الفكرة على إنشاء بيئة رقمية تجمع بين صاحب المشروع والمستثمر في مكان
              واحد، بحيث يكون عرض المشروع واضحًا ومنظمًا ويسهل مراجعته وفهمه.
            </p>
          </article>

          <article className="content-card">
            <h3>الفئات المستهدفة</h3>
            <p>
              المنصة تخدم رواد الأعمال لعرض مشاريعهم، وتخدم المستثمرين لاستكشاف الفرص،
              كما توفر للإدارة بيئة متابعة واعتماد منظمة.
            </p>
          </article>

          <article className="content-card">
            <h3>القيمة الأساسية</h3>
            <p>
              بدلاً من الاعتماد على عرض عشوائي وغير موحد، تقدم المنصة نموذجًا واضحًا
              يساعد على المقارنة واتخاذ قرار أوضح.
            </p>
          </article>

          <article className="content-card">
            <h3>الرؤية المستقبلية</h3>
            <p>
              تم تجهيز النظام ليكون قابلًا للتوسع لاحقًا في التحليل الذكي، التوصيات،
              العروض الاستثمارية، إدارة الصفقات، والرسائل.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}