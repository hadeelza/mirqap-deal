import { Link } from "react-router-dom";
import { ROUTES } from "../../../core/constants/routes";

export default function CTASection() {
  return (
    <section className="public-section">
      <div className="container">
        <div className="cta-box">
          <div>
            <span className="section-chip">ابدأ رحلتك الآن</span>
            <h2>أنشئ حسابك وابدأ باستخدام المنصة</h2>
            <p>
              سواء كنت رائد أعمال أو مستثمر، المنصة مهيأة لبداية واضحة ومنظمة.
            </p>
          </div>

          <div className="cta-box__actions">
            <Link to={ROUTES.auth.register} className="btn btn--primary">
              إنشاء حساب
            </Link>
            <Link to={ROUTES.auth.signIn} className="btn btn--ghost">
              تسجيل دخول
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}