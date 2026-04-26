import { Outlet, Link } from "react-router-dom";
import { ROUTES } from "../../core/constants/routes";
import { APP_CONFIG } from "../../core/config/app-config";

export default function AuthLayout() {
  return (
    <div className="public-shell" dir="rtl">
      <header className="public-header">
        <div className="container public-header__inner">
          <Link to={ROUTES.public.main} className="brand">
            <span className="brand__logo">ج</span>
            <div className="brand__content">
              <strong>{APP_CONFIG.appNameAr}</strong>
              <span>{APP_CONFIG.appTaglineAr}</span>
            </div>
          </Link>

          <div className="public-header__actions">
            <Link to={ROUTES.public.main} className="btn btn--ghost">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}