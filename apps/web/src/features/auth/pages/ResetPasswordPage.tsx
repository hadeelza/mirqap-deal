import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../core/constants/routes";
import { resetPasswordService } from "../services/auth.service";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!password || !confirmPassword) {
      setErrorMessage("أدخل كلمة المرور الجديدة ثم أكدها");
      setMessage("");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setMessage("");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("كلمتا المرور غير متطابقتين");
      setMessage("");
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");
      setIsSubmitting(true);
      await resetPasswordService(password);
      setMessage("تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const messageValue = error instanceof Error ? error.message : "تعذر تحديث كلمة المرور حالياً.";
      setErrorMessage(messageValue);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page container">
      <div className="auth-card">
        <div className="auth-card__side auth-card__side--brand">
          <div>
            <span className="auth-eyebrow">كلمة مرور جديدة</span>
            <h2 className="auth-title">أنشئ كلمة مرور جديدة لحسابك</h2>
            <p className="auth-subtitle">بعد الحفظ ستتمكن من استخدام كلمة المرور الجديدة مباشرة.</p>
          </div>
        </div>

        <div className="auth-card__side">
          <div className="auth-panel">
            <div className="auth-panel__header">
              <h1 className="auth-panel__title">إعادة تعيين كلمة المرور</h1>
              <p className="auth-panel__subtitle">أدخل كلمة المرور الجديدة ثم أكدها.</p>
            </div>

            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              <div className="auth-field">
                <label htmlFor="reset-password">كلمة المرور الجديدة</label>
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="reset-confirm-password">تأكيد كلمة المرور</label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              {message ? <div className="auth-success">{message}</div> : null}
              {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

              <div className="auth-inline-links">
                <Link to={ROUTES.auth.signIn}>الذهاب لتسجيل الدخول</Link>
              </div>

              <div className="auth-actions">
                <button className="btn btn--primary auth-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}