import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";

type EntrepreneurTopbarProps = {
  title: string;
  fullName: string;
  unreadNotificationsCount: number;
  onOpenSidebar: () => void;
  onLogout: () => Promise<void> | void;
};

export default function EntrepreneurTopbar({
  title,
  fullName,
  unreadNotificationsCount,
  onOpenSidebar,
  onLogout,
}: EntrepreneurTopbarProps) {
  return (
    <header className="entrepreneur-topbar">
      <div className="entrepreneur-topbar__start">
        <button
          type="button"
          className="entrepreneur-topbar__menu"
          onClick={onOpenSidebar}
          aria-label="فتح القائمة"
        >
          ☰
        </button>

        <div className="entrepreneur-topbar__title-wrap">
          <h1 className="entrepreneur-topbar__title">{title}</h1>
          <span className="entrepreneur-topbar__subtitle">مرحبًا، {fullName}</span>
        </div>
      </div>

      <div className="entrepreneur-topbar__actions">
        <Link to={ROUTES.entrepreneur.notifications} className="entrepreneur-topbar__icon-btn">
          <span>الإشعارات</span>
          {unreadNotificationsCount > 0 ? (
            <b className="entrepreneur-topbar__badge">{unreadNotificationsCount}</b>
          ) : null}
        </Link>

        <Link to={ROUTES.entrepreneur.profile} className="entrepreneur-topbar__ghost-btn">
          الملف الشخصي
        </Link>

        <button
          type="button"
          className="entrepreneur-topbar__primary-btn"
          onClick={() => void onLogout()}
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}