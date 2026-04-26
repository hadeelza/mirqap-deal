export default function InvestorNotificationsPage() {
    return (
      <section className="investor-page">
        <div className="investor-page__hero">
          <span className="investor-page__eyebrow">Notifications</span>
          <h2>الإشعارات</h2>
          <p>هذه الصفحة ستعرض كل التنبيهات المهمة للمستثمر مثل ردود العروض والرسائل والصفقات ونتائج الذكاء.</p>
        </div>
  
        <div className="investor-placeholder-grid">
          <div className="investor-placeholder-card">
            <h3>قائمة الإشعارات</h3>
            <p>عرض جميع الإشعارات مع حالتها كمقروءة أو غير مقروءة.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>التنقل الذكي</h3>
            <p>الانتقال لاحقًا بحسب ref_type و ref_id إلى الشاشة المناسبة.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>إدارة القراءة</h3>
            <p>تحديث حالة الإشعار واحتساب غير المقروء في الشريط العلوي.</p>
          </div>
        </div>
      </section>
    );
  }