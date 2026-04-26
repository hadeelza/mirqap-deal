import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { appUser, signOut } = useAuthUser();

  return (
    <section className="container" dir="rtl" style={{ padding: "32px 0" }}>
      <div className="dashboard-placeholder">
        <h1>لوحة الإدارة</h1>
        <p>مرحباً {appUser?.full_name}، تم تفعيل مسار الإدارة بنجاح ويمكنك الآن متابعة بناء بقية الصفحات.</p>
        <div className="dashboard-placeholder__actions">
          <button className="btn btn--primary" type="button">
            المتابعة لاحقاً
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