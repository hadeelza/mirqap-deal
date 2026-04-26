import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInSchema } from "../../../core/schemas/auth.schema";
import { signInUser } from "../services/auth.service";

export default function SignInForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const parsed = signInSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message || "تحقق من البيانات");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signInUser(parsed.data);
      navigate(result.redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "تعذر تسجيل الدخول");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
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
        <label>كلمة المرور</label>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="••••••••"
        />
      </div>

      {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

      <button type="submit" className="btn btn--primary auth-submit" disabled={isSubmitting}>
        {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}