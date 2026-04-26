import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <section className="auth-page container">
      <div className="auth-card">
        <div className="auth-card__side auth-card__side--brand">
          <div>
            <span className="auth-eyebrow">حساب جديد</span>
            <h2 className="auth-title">أنشئ حسابك وابدأ بناء فرصتك داخل جسر الملاك</h2>
            <p className="auth-subtitle">
              اختر دورك أولاً، ثم أكمل بياناتك الأساسية لتنتقل إلى المسار المناسب تلقائياً.
            </p>
          </div>

          <ul className="auth-points">
            <li>
              <span className="auth-points__dot" />
              تسجيل كرائد أعمال أو مستثمر
            </li>
            <li>
              <span className="auth-points__dot" />
              حفظ البيانات داخل Supabase Auth وقاعدة البيانات
            </li>
            <li>
              <span className="auth-points__dot" />
              توجيه تلقائي بعد اكتمال الملف الشخصي
            </li>
          </ul>
        </div>

        <div className="auth-card__side">
          <RegisterForm />
        </div>
      </div>
    </section>
  );
}