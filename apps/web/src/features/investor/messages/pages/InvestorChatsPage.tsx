export default function InvestorChatsPage() {
    return (
      <section className="investor-page">
        <div className="investor-page__hero">
          <span className="investor-page__eyebrow">Chats</span>
          <h2>المحادثات</h2>
          <p>هذه الصفحة ستكون مدخل المستثمر إلى جميع المحادثات المرتبطة بالمشاريع والعروض والصفقات.</p>
        </div>
  
        <div className="investor-placeholder-grid">
          <div className="investor-placeholder-card">
            <h3>قائمة المحادثات</h3>
            <p>عرض كل محادثة مرتبطة بمشروع أو عرض أو صفقة.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>تفاصيل المحادثة</h3>
            <p>الدخول إلى الرسائل وقراءة السجل وإرسال الردود.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>التنبيهات المرتبطة</h3>
            <p>إنشاء إشعار عند وصول رسالة جديدة لاحقًا.</p>
          </div>
        </div>
      </section>
    );
  }