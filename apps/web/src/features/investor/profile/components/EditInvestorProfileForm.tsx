import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";

export interface EditInvestorProfileFormValues {
  fullName: string;
  phone: string;
  organizationName: string;
  bio: string;
  websiteUrl: string;
  linkedinUrl: string;
  isDiscoverable: boolean;
}

interface EditInvestorProfileFormProps {
  initialValues: EditInvestorProfileFormValues;
  isSubmitting: boolean;
  onSubmit: (values: EditInvestorProfileFormValues) => Promise<void>;
}

export default function EditInvestorProfileForm({
  initialValues,
  isSubmitting,
  onSubmit,
}: EditInvestorProfileFormProps) {
  const [values, setValues] = useState<EditInvestorProfileFormValues>(initialValues);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fullName = values.fullName.trim();
    const phone = values.phone.trim();
    const organizationName = values.organizationName.trim();
    const bio = values.bio.trim();

    if (fullName.length < 3) {
      setLocalError("الاسم الكامل يجب أن يكون 3 أحرف على الأقل.");
      return;
    }

    if (phone.length < 8) {
      setLocalError("رقم الجوال غير صحيح.");
      return;
    }

    if (organizationName.length < 2) {
      setLocalError("اسم الجهة أو المنظمة مطلوب.");
      return;
    }

    if (bio.length < 10) {
      setLocalError("النبذة التعريفية قصيرة جداً.");
      return;
    }

    setLocalError("");
    await onSubmit(values);
  }

  return (
    <form className="investor-edit-profile-form" onSubmit={handleSubmit}>
      <div className="investor-edit-profile-form__section">
        <h2 className="investor-edit-profile-form__section-title">المعلومات الأساسية</h2>

        <div className="investor-edit-profile-form__grid investor-edit-profile-form__grid--2">
          <div className="investor-edit-profile-form__field">
            <label htmlFor="investor-full-name">الاسم الكامل</label>
            <input
              id="investor-full-name"
              type="text"
              value={values.fullName}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              placeholder="الاسم الكامل"
            />
          </div>

          <div className="investor-edit-profile-form__field">
            <label htmlFor="investor-phone">رقم الجوال</label>
            <input
              id="investor-phone"
              type="text"
              value={values.phone}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              placeholder="05xxxxxxxx"
            />
          </div>

          <div className="investor-edit-profile-form__field investor-edit-profile-form__field--full">
            <label htmlFor="investor-organization-name">الجهة / المنظمة</label>
            <input
              id="investor-organization-name"
              type="text"
              value={values.organizationName}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  organizationName: event.target.value,
                }))
              }
              placeholder="اسم الجهة أو المنظمة"
            />
          </div>
        </div>
      </div>

      <div className="investor-edit-profile-form__section">
        <h2 className="investor-edit-profile-form__section-title">النبذة والروابط</h2>

        <div className="investor-edit-profile-form__grid investor-edit-profile-form__grid--2">
          <div className="investor-edit-profile-form__field investor-edit-profile-form__field--full">
            <label htmlFor="investor-bio">النبذة التعريفية</label>
            <textarea
              id="investor-bio"
              value={values.bio}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  bio: event.target.value,
                }))
              }
              placeholder="نبذة مختصرة عن الجهة الاستثمارية"
              rows={6}
            />
          </div>

          <div className="investor-edit-profile-form__field">
            <label htmlFor="investor-website-url">الموقع الإلكتروني</label>
            <input
              id="investor-website-url"
              type="text"
              value={values.websiteUrl}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  websiteUrl: event.target.value,
                }))
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="investor-edit-profile-form__field">
            <label htmlFor="investor-linkedin-url">LinkedIn</label>
            <input
              id="investor-linkedin-url"
              type="text"
              value={values.linkedinUrl}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  linkedinUrl: event.target.value,
                }))
              }
              placeholder="https://linkedin.com/..."
            />
          </div>
        </div>
      </div>

      <div className="investor-edit-profile-form__section">
        <h2 className="investor-edit-profile-form__section-title">إعدادات الظهور</h2>

        <label className="investor-edit-profile-form__checkbox">
          <input
            type="checkbox"
            checked={values.isDiscoverable}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                isDiscoverable: event.target.checked,
              }))
            }
          />
          <span>إظهار الحساب ضمن نتائج الاكتشاف والمطابقة</span>
        </label>
      </div>

      {localError ? <div className="investor-profile-alert investor-profile-alert--error">{localError}</div> : null}

      <div className="investor-edit-profile-form__footer">
        <Link to={ROUTES.investor.profile} className="btn btn--secondary">
          إلغاء
        </Link>

        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}