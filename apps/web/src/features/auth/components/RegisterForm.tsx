import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerSchema } from "../../../core/schemas/auth.schema";
import { registerUser } from "../services/auth.service";

type AccountRole = "investor" | "entrepreneur";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "entrepreneur" as AccountRole,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const parsed = registerSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message || "تحقق من البيانات");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUser({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
        role: parsed.data.role,
      });

      if (result.needsEmailConfirmation) {
        setSuccessMessage("تم إنشاء الحساب بنجاح، تحقق من بريدك الإلكتروني ثم سجل الدخول");
        navigate(result.redirectTo, { replace: true });
        return;
      }

      navigate(result.redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "تعذر إنشاء الحساب");
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectRole(role: AccountRole) {
    setForm((prev) => ({
      ...prev,
      role,
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-field">
        <label>الاسم الكامل</label>
        <input
          type="text"
          value={form.fullName}
          onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
          placeholder="الاسم الكامل"
        />
      </div>

      <div className="form-field">
        <label>البريد الإلكتروني</label>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="name@example.com"
        />
      </div>

      <div className="form-field">
        <label>رقم الجوال</label>
        <input
          type="text"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          placeholder="05xxxxxxxx"
        />
      </div>

      <div className="form-field">
        <label>نوع الحساب</label>

        <div className="auth-role-picker">
          <button
            type="button"
            className={
              form.role === "entrepreneur"
                ? "auth-role-card auth-role-card--active"
                : "auth-role-card"
            }
            onClick={() => selectRole("entrepreneur")}
            aria-pressed={form.role === "entrepreneur"}
          >
            <div className="auth-role-card__top">
              <div className="auth-role-card__icon">ر</div>
              <div className="auth-role-card__check" />
            </div>

            <div className="auth-role-card__content">
              <h3>رائد أعمال</h3>
              <p>
                أنشئ مشروعك، ارفع ملفاتك، اعرض التقييم الذكي، واستقبل العروض الاستثمارية.
              </p>
            </div>
          </button>

          <button
            type="button"
            className={
              form.role === "investor"
                ? "auth-role-card auth-role-card--active"
                : "auth-role-card"
            }
            onClick={() => selectRole("investor")}
            aria-pressed={form.role === "investor"}
          >
            <div className="auth-role-card__top">
              <div className="auth-role-card__icon">م</div>
              <div className="auth-role-card__check" />
            </div>

            <div className="auth-role-card__content">
              <h3>مستثمر</h3>
              <p>
                استكشف المشاريع، شاهد التحليلات الذكية، حدّد اهتماماتك، وقدّم عروضك بسهولة.
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="form-field">
        <label>كلمة المرور</label>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="••••••••"
        />
      </div>

      <div className="form-field">
        <label>تأكيد كلمة المرور</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
          }
          placeholder="••••••••"
        />
      </div>

      {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}
      {successMessage ? <div className="auth-success">{successMessage}</div> : null}

      <button type="submit" className="btn btn--primary auth-submit" disabled={isSubmitting}>
        {isSubmitting ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
      </button>
    </form>
  );
}