export default function MyOffersPage() {
    return (
      <section className="investor-page">
        <div className="investor-page__hero">
          <span className="investor-page__eyebrow">My Offers</span>
          <h2>عروضي الاستثمارية</h2>
          <p>هذه الصفحة ستعرض كل العروض التي أرسلها المستثمر مع حالتها الحالية ومتابعة الردود عليها.</p>
        </div>
  
        <div className="investor-placeholder-grid">
          <div className="investor-placeholder-card">
            <h3>العروض المرسلة</h3>
            <p>عرض جميع العروض مع المبلغ والنسبة والحالة.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>تفاصيل كل عرض</h3>
            <p>فتح العرض ومعرفة الرد أو حالة التفاوض أو القبول أو الرفض.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>الربط مع المشروع</h3>
            <p>الوصول السريع للمشروع المرتبط بالعرض.</p>
          </div>
        </div>
      </section>
    );
  }