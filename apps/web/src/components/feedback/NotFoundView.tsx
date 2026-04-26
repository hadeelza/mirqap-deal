import { Link } from "react-router-dom";
import { ROUTES } from "../../core/constants/routes";

export default function NotFoundView() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "24px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "var(--shadow)",
        }}
      >
        <h1 style={{ margin: "0 0 12px" }}>الصفحة غير موجودة</h1>
        <p style={{ margin: "0 0 20px", color: "var(--text-soft)", lineHeight: 1.9 }}>
          الرابط الذي حاولت الوصول إليه غير متوفر حاليًا داخل المشروع.
        </p>
        <Link to={ROUTES.public.landing} className="btn btn--primary">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}