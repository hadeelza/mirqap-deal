import { type FormEvent } from "react";

export type EditEntrepreneurProfileFormValues = {
  fullName: string;
  phone: string;
  entrepreneurType: "individual" | "team" | "company" | "institution";
  bio: string;
  city: string;
  country: string;
  organizationName: string;
  websiteUrl: string;
  linkedinUrl: string;
};

type EditEntrepreneurProfileFormProps = {
  values: EditEntrepreneurProfileFormValues;
  onChange: (values: EditEntrepreneurProfileFormValues) => void;
  onSubmit: (values: EditEntrepreneurProfileFormValues) => Promise<void> | void;
  isSubmitting: boolean;
};

export default function EditEntrepreneurProfileForm({
  values,
  onChange,
  onSubmit,
  isSubmitting,
}: EditEntrepreneurProfileFormProps) {
  function updateField<K extends keyof EditEntrepreneurProfileFormValues>(
    key: K,
    value: EditEntrepreneurProfileFormValues[K]
  ) {
    onChange({
      ...values,
      [key]: value,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit(values);
  }

  return (
    <form className="entrepreneur-profile-form-card" onSubmit={handleSubmit}>
      <div className="entrepreneur-profile-form-grid">
        <div className="entrepreneur-form-field">
          <label htmlFor="entrepreneur-full-name">الاسم الكامل</label>
          <input
            id="entrepreneur-full-name"
            type="text"
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="الاسم الكامل"
            required
          />
        </div>

        <div className="entrepreneur-form-field">
          <label htmlFor="entrepreneur-phone">رقم الجوال</label>
          <input
            id="entrepreneur-phone"
            type="text"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="05xxxxxxxx"
            required
          />
        </div>

        <div className="entrepreneur-form-field">
          <label htmlFor="entrepreneur-type">نوع رائد الأعمال</label>
          <select
            id="entrepreneur-type"
            value={values.entrepreneurType}
            onChange={(event) =>
              updateField(
                "entrepreneurType",
                event.target.value as EditEntrepreneurProfileFormValues["entrepreneurType"]
              )
            }
          >
            <option value="individual">فردي</option>
            <option value="team">فريق</option>
            <option value="company">شركة</option>
            <option value="institution">مؤسسة</option>
          </select>
        </div>

        <div className="entrepreneur-form-field">
          <label htmlFor="entrepreneur-city">المدينة</label>
          <input
            id="entrepreneur-city"
            type="text"
            value={values.city}
            onChange={(event) => updateField("city", event.target.value)}
            placeholder="المدينة"
            required
          />
        </div>

        <div className="entrepreneur-form-field">
          <label htmlFor="entrepreneur-country">الدولة</label>
          <input
            id="entrepreneur-country"
            type="text"
            value={values.country}
            onChange={(event) => updateField("country", event.target.value)}
            placeholder="الدولة"
            required
          />
        </div>

        <div className="entrepreneur-form-field">
          <label htmlFor="entrepreneur-organization-name">اسم الجهة أو الشركة</label>
          <input
            id="entrepreneur-organization-name"
            type="text"
            value={values.organizationName}
            onChange={(event) => updateField("organizationName", event.target.value)}
            placeholder="اسم الجهة أو الشركة"
            required
          />
        </div>

        <div className="entrepreneur-form-field">
          <label htmlFor="entrepreneur-website">رابط الموقع</label>
          <input
            id="entrepreneur-website"
            type="url"
            value={values.websiteUrl}
            onChange={(event) => updateField("websiteUrl", event.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="entrepreneur-form-field">
          <label htmlFor="entrepreneur-linkedin">رابط لينكدإن</label>
          <input
            id="entrepreneur-linkedin"
            type="url"
            value={values.linkedinUrl}
            onChange={(event) => updateField("linkedinUrl", event.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </div>

      <div className="entrepreneur-form-field entrepreneur-form-field--full">
        <label htmlFor="entrepreneur-bio">نبذة تعريفية</label>
        <textarea
          id="entrepreneur-bio"
          value={values.bio}
          onChange={(event) => updateField("bio", event.target.value)}
          placeholder="اكتب نبذة مختصرة عنك أو عن مشروعك"
          rows={6}
          required
        />
      </div>

      <div className="entrepreneur-profile-form-actions">
        <button type="submit" className="entrepreneur-primary-btn" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}