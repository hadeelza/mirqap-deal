export default function InvestorProfilePage() {
    return (
      <section className="investor-page">
        <div className="investor-page__hero">
          <span className="investor-page__eyebrow">Profile</span>
          <h2>الملف الشخصي</h2>
          <p>هذه الصفحة ستكون مخصصة لعرض بيانات المستثمر الأساسية وبيانات المؤسسة ورؤية الحساب.</p>
        </div>
  
        <div className="investor-placeholder-grid">
          <div className="investor-placeholder-card">
            <h3>بيانات المستثمر</h3>
            <p>الاسم، البريد، الجوال، نوع المستثمر، وروابطه المهنية.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>الملف المؤسسي</h3>
            <p>اسم الجهة، النبذة، والموقع الإلكتروني.</p>
          </div>
  
          <div className="investor-placeholder-card">
            <h3>إعدادات الظهور</h3>
            <p>الملف العام أو الخاص وإمكانية الاكتشاف داخل المنصة.</p>
          </div>
        </div>
      </section>
    );
  }