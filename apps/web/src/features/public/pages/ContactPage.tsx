import { useMemo, useState } from "react";
import { APP_CONFIG } from "../../../core/config/app-config";

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialState: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [errorMessage, setErrorMessage] = useState("");

  const contactItems = useMemo(() => {
    return [
      { label: "البريد الإلكتروني", value: APP_CONFIG.contactEmail },
      { label: "الهاتف", value: APP_CONFIG.contactPhone },
      { label: "الموقع", value: APP_CONFIG.contactLocation },
    ].filter((item) => item.value);
  }, []);

  const updateField = (field: keyof ContactFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      setErrorMessage("يرجى تعبئة جميع الحقول أولًا.");
      return;
    }

    if (!APP_CONFIG.contactEmail) {
      setErrorMessage(
        "أضف بيانات التواصل داخل ملف البيئة أولًا حتى يعمل نموذج التواصل بشكل مباشر.",
      );
      return;
    }

    const mailtoUrl = `mailto:${APP_CONFIG.contactEmail}?subject=${encodeURIComponent(
      form.subject,
    )}&body=${encodeURIComponent(
      `الاسم: ${form.name}\nالبريد: ${form.email}\n\n${form.message}`,
    )}`;

    window.location.href = mailtoUrl;
  };

  return (
    <div className="content-page">
      <div className="container">
        <div className="section-heading">
          <span className="section-chip">اتصل بنا</span>
          <h1 className="page-title">نرحب بتواصلك معنا</h1>
          <p className="page-subtitle">
            يمكنك استخدام النموذج التالي أو بيانات التواصل المباشرة الظاهرة في الصفحة.
          </p>
        </div>

        <div className="contact-grid">
          <div className="content-card">
            <h3>بيانات التواصل</h3>

            {contactItems.length > 0 ? (
              <div className="contact-list">
                {contactItems.map((item) => (
                  <div key={item.label} className="contact-list__item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted-text">
                لم يتم إعداد بيانات التواصل بعد. أضف هذه القيم في ملف البيئة:
                <br />
                VITE_PUBLIC_CONTACT_EMAIL
                <br />
                VITE_PUBLIC_CONTACT_PHONE
                <br />
                VITE_PUBLIC_CONTACT_LOCATION
              </p>
            )}
          </div>

          <form className="content-card contact-form" onSubmit={handleSubmit}>
            <h3>أرسل رسالتك</h3>

            <div className="form-grid">
              <div className="form-field">
                <label>الاسم</label>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="اكتب اسمك"
                />
              </div>

              <div className="form-field">
                <label>البريد الإلكتروني</label>
                <input
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="form-field form-field--full">
                <label>الموضوع</label>
                <input
                  value={form.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  placeholder="موضوع الرسالة"
                />
              </div>

              <div className="form-field form-field--full">
                <label>الرسالة</label>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder="اكتب رسالتك هنا"
                />
              </div>
            </div>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <button type="submit" className="btn btn--primary btn--full">
              إرسال الرسالة
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}