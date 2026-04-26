import type { RegisterFormValues } from "../../../core/types/auth.types";

interface RolePickerProps {
  value: RegisterFormValues["role"];
  onChange: (role: RegisterFormValues["role"]) => void;
}

export default function RolePicker({ value, onChange }: RolePickerProps) {
  return (
    <div className="role-picker">
      <button
        type="button"
        className={value === "entrepreneur" ? "role-card role-card--active" : "role-card"}
        onClick={() => onChange("entrepreneur")}
      >
        <h3 className="role-card__title">رائد أعمال</h3>
        <p className="role-card__desc">أنشئ مشروعك، أكمل ملفك، وارفع فرصتك أمام المستثمرين.</p>
      </button>

      <button
        type="button"
        className={value === "investor" ? "role-card role-card--active" : "role-card"}
        onClick={() => onChange("investor")}
      >
        <h3 className="role-card__title">مستثمر</h3>
        <p className="role-card__desc">استكشف المشاريع المناسبة وتابع الفرص وفق اهتماماتك.</p>
      </button>
    </div>
  );
}