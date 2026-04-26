import { Link } from "react-router-dom";
import { APP_CONFIG } from "../../../core/config/app-config";
import { ROUTES } from "../../../core/constants/routes";

export default function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="container landing-hero__grid">
        <div className="landing-hero__content">
          <span className="section-chip">الاستثمار الذكي يبدأ من وضوح البيانات</span>
          <h1>{APP_CONFIG.appNameAr}</h1>
          <p>
            منصة عربية حديثة تساعد رواد الأعمال على عرض مشاريعهم بشكل احترافي، وتمكّن
            المستثمرين من استكشاف الفرص بطريقة منظمة وواضحة.
          </p>

          <div className="landing-hero__actions">
            <Link to={ROUTES.public.main} className="btn btn--primary">
              اكتشف المنصة
            </Link>
            <Link to={ROUTES.auth.register} className="btn btn--ghost">
              ابدأ الآن
            </Link>
          </div>
        </div>

        <div className="landing-preview">
          <div className="landing-preview__window">
            <div className="landing-preview__top">
              <span />
              <span />
              <span />
            </div>

            <div className="landing-preview__header">
              <div>
                <strong>لوحة مؤشرات مبسطة</strong>
                <small>تصميم عربي حديث</small>
              </div>
              <div className="landing-preview__badge">AI</div>
            </div>

            <div className="landing-preview__stats">
              <div className="landing-preview__stat">
                <label>المشاريع</label>
                <strong>من قاعدة البيانات</strong>
              </div>
              <div className="landing-preview__stat">
                <label>القطاعات</label>
                <strong>تصنيف منظم</strong>
              </div>
              <div className="landing-preview__stat">
                <label>التحليل</label>
                <strong>عرض أوضح</strong>
              </div>
            </div>

            <div className="landing-preview__bars">
              <span style={{ height: "84%" }} />
              <span style={{ height: "66%" }} />
              <span style={{ height: "74%" }} />
              <span style={{ height: "58%" }} />
              <span style={{ height: "79%" }} />
              <span style={{ height: "51%" }} />
              <span style={{ height: "64%" }} />
              <span style={{ height: "47%" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}