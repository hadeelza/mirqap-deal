import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";

type EntrepreneurSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => Promise<void> | void;
  fullName: string;
  email: string;
  organizationName: string;
};

const navItems = [
  { to: ROUTES.entrepreneur.dashboard, label: "لوحة التحكم" },
  { to: ROUTES.entrepreneur.projects, label: "مشاريعي" },
  { to: ROUTES.entrepreneur.createProject, label: "إضافة مشروع" },
  { to: ROUTES.entrepreneur.browseInvestors, label: "استعراض المستثمرين" },
  { to: ROUTES.entrepreneur.offers, label: "العروض المستلمة" },
  { to: ROUTES.entrepreneur.chats, label: "المحادثات" },
  { to: ROUTES.entrepreneur.notifications, label: "الإشعارات" },
  { to: ROUTES.entrepreneur.profile, label: "الملف الشخصي" },
];

export default function EntrepreneurSidebar({
  isOpen,
  onClose,
  onLogout,
  fullName,
  email,
  organizationName,
}: EntrepreneurSidebarProps) {
  return (
    <>
      <button
        type="button"
        className={`entrepreneur-sidebar__backdrop ${isOpen ? "is-open" : ""}`}
        onClick={onClose}
        aria-label="إغلاق القائمة"
      />

      <aside className={`entrepreneur-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="entrepreneur-sidebar__brand">
          <Link to={ROUTES.entrepreneur.dashboard} className="entrepreneur-brand" onClick={onClose}>
            <span className="entrepreneur-brand__logo">ص</span>
            <div className="entrepreneur-brand__text">
              <strong>صفقة بمرقاب</strong>
              <span>لوحة رائد الأعمال</span>
            </div>
          </Link>
        </div>

        <div className="entrepreneur-sidebar__profile">
          <div className="entrepreneur-sidebar__avatar">{fullName?.charAt(0) || "ر"}</div>
          <div className="entrepreneur-sidebar__profile-text">
            <strong>{fullName}</strong>
            <span>{organizationName || email}</span>
          </div>
        </div>

        <nav className="entrepreneur-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.entrepreneur.dashboard}
              onClick={onClose}
              className={({ isActive }: { isActive: boolean }) =>
                isActive
                  ? "entrepreneur-sidebar__link entrepreneur-sidebar__link--active"
                  : "entrepreneur-sidebar__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="entrepreneur-sidebar__footer">
          <button
            type="button"
            className="entrepreneur-sidebar__logout"
            onClick={() => void onLogout()}
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}