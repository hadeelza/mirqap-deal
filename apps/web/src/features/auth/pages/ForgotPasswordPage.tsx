import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../core/constants/routes";
import { forgotPasswordService } from "../services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    try {
      setMessage("");
      setErrorMessage("");
      setIsSubmitting(true);
      await forgotPasswordService(email);
      setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    } catch (error) {
      const messageValue = error instanceof Error ? error.message : "تعذر إرسال رابط الاستعادة حالياً.";
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
            <span className="auth-eyebrow">استعادة الحساب</span>
            <h2 className="auth-title">استرجع الوصول إلى حسابك بسهولة</h2>
            <p className="auth-subtitle">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>
          </div>
        </div>

        <div className="auth-card__side">
          <div className="auth-panel">
            <div className="auth-panel__header">
              <h1 className="auth-panel__title">نسيت كلمة المرور</h1>
              <p className="auth-panel__subtitle">سنرسل لك رابط إعادة التعيين إلى البريد المسجل.</p>
            </div>

            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              <div className="auth-field">
                <label htmlFor="forgot-email">البريد الإلكتروني</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {message ? <div className="auth-success">{message}</div> : null}
              {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

              <div className="auth-inline-links">
                <Link to={ROUTES.auth.signIn}>العودة لتسجيل الدخول</Link>
              </div>

              <div className="auth-actions">
                <button className="btn btn--primary auth-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الرابط"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}