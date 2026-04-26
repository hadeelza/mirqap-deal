import { Link, NavLink, Outlet } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import { APP_CONFIG } from "../../core/config/app-config";
import { ROUTES } from "../../core/constants/routes";

const getNavLinkClassName = ({ isActive }: NavLinkRenderProps) => {
  return isActive ? "public-nav__link public-nav__link--active" : "public-nav__link";
};

export default function PublicLayout() {
  return (
    <div className="public-shell" dir="rtl">
      <header className="public-header">
        <div className="container public-header__inner">
          <Link to={ROUTES.public.landing} className="brand">
            <span className="brand__logo">ج</span>
            <div className="brand__content">
              <strong>{APP_CONFIG.appNameAr}</strong>
              <span>{APP_CONFIG.appTaglineAr}</span>
            </div>
          </Link>

          <nav className="public-nav">
            <NavLink to={ROUTES.public.main} className={getNavLinkClassName}>
              الرئيسية
            </NavLink>

            <NavLink to={ROUTES.public.about} className={getNavLinkClassName}>
              من نحن
            </NavLink>

            <NavLink to={ROUTES.public.contact} className={getNavLinkClassName}>
              اتصل بنا
            </NavLink>
          </nav>

          <div className="public-header__actions">
            <Link to={ROUTES.auth.signIn} className="btn btn--ghost">
              تسجيل دخول
            </Link>
            <Link to={ROUTES.auth.register} className="btn btn--primary">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container public-footer__inner">
          <div>
            <h3>{APP_CONFIG.appNameAr}</h3>
            <p>منصة عربية لربط المستثمرين برواد الأعمال عبر تجربة واضحة وحديثة.</p>
          </div>

          <div className="public-footer__links">
            <Link to={ROUTES.public.main}>الرئيسية</Link>
            <Link to={ROUTES.public.about}>من نحن</Link>
            <Link to={ROUTES.public.contact}>اتصل بنا</Link>
          </div>
        </div>

        <div className="public-footer__bottom">
          <div className="container">
            © {new Date().getFullYear()} {APP_CONFIG.appNameAr}
          </div>
        </div>
      </footer>
    </div>
  );
}