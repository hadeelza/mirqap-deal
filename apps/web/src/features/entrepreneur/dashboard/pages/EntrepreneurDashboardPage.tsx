import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";

export default function EntrepreneurDashboardPage() {
  const navigate = useNavigate();
  const { appUser, signOut } = useAuthUser();

  return (
    <section className="container" dir="rtl" style={{ padding: "32px 0" }}>
      <div className="dashboard-placeholder">
        <h1>لوحة رائد الأعمال</h1>
        <p>مرحباً {appUser?.full_name}، تم تفعيل حسابك وتوجيهك إلى المسار الخاص برواد الأعمال.</p>
        <div className="dashboard-placeholder__actions">
          <button className="btn btn--primary" type="button">
            إنشاء مشروع لاحقاً
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/auth/sign-in", { replace: true });
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </section>
  );
}