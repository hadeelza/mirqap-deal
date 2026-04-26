import SignInForm from "../components/SignInForm";

export default function SignInPage() {
  return (
    <section className="auth-page container">
      <div className="auth-card">
        <div className="auth-card__side auth-card__side--brand">
          <div>
            <span className="auth-eyebrow">الوصول الآمن</span>
            <h2 className="auth-title">ادخل إلى حسابك وابدأ رحلتك الاستثمارية بثقة</h2>
            <p className="auth-subtitle">
              سواء كنت مستثمراً أو رائد أعمال، ستصل مباشرة إلى المسار المناسب داخل المنصة.
            </p>
          </div>

          <ul className="auth-points">
            <li>
              <span className="auth-points__dot" />
              توصيات ذكية مبنية على بيانات المشاريع
            </li>
            <li>
              <span className="auth-points__dot" />
              ربط واضح بين المستثمرين ورواد الأعمال
            </li>
            <li>
              <span className="auth-points__dot" />
              تجربة عربية منظمة وسهلة الاستخدام
            </li>
          </ul>
        </div>

        <div className="auth-card__side">
          <SignInForm />
        </div>
      </div>
    </section>
  );
}