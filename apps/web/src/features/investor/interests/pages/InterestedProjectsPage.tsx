export default function InterestedProjectsPage() {
    return (
      <section className="investor-page">
        <div className="investor-page__hero">
          <span className="investor-page__eyebrow">Interested Projects</span>
          <h2>المشاريع المهتم بها</h2>
          <p>هذه الصفحة ستعرض المشاريع التي قام المستثمر بحفظها أو وضع علامة اهتمام عليها.</p>
        </div>
  
        <div className="investor-placeholder-grid">
          <div className="investor-placeholder-card">
            <h3>القائمة المحفوظة</h3>
            <p>عرض كل مشروع قام المستثمر بوضع علامة اهتمام عليه.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>الرجوع للتفاصيل</h3>
            <p>فتح المشروع مرة أخرى ومتابعة AI summary والملفات والعروض.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>إدارة الاهتمامات</h3>
            <p>إزالة الاهتمام أو الانتقال لتقديم عرض استثماري لاحقًا.</p>
          </div>
        </div>
      </section>
    );
  }