import { Link } from "react-router-dom";
import type { EntrepreneurProfileViewModel } from "../pages/EntrepreneurProfilePage";

type EntrepreneurProfileCardProps = {
  profile: EntrepreneurProfileViewModel;
};

function renderValue(value: string) {
  return value && value.trim().length > 0 ? value : "غير متوفر";
}

export default function EntrepreneurProfileCard({
  profile,
}: EntrepreneurProfileCardProps) {
  return (
    <div className="entrepreneur-profile-card">
      <div className="entrepreneur-profile-card__top">
        <div className="entrepreneur-profile-card__identity">
          <div className="entrepreneur-profile-card__avatar">
            {profile.fullName ? profile.fullName.charAt(0) : "ر"}
          </div>

          <div>
            <h3 className="entrepreneur-profile-card__name">{renderValue(profile.fullName)}</h3>
            <p className="entrepreneur-profile-card__role">رائد أعمال</p>
          </div>
        </div>

        <Link to="/entrepreneur/profile/edit" className="entrepreneur-profile-card__edit-btn">
          تعديل الملف الشخصي
        </Link>
      </div>

      <div className="entrepreneur-profile-card__grid">
        <div className="entrepreneur-profile-item">
          <span className="entrepreneur-profile-item__label">البريد الإلكتروني</span>
          <strong className="entrepreneur-profile-item__value">
            {renderValue(profile.email)}
          </strong>
        </div>

        <div className="entrepreneur-profile-item">
          <span className="entrepreneur-profile-item__label">رقم الجوال</span>
          <strong className="entrepreneur-profile-item__value">
            {renderValue(profile.phone)}
          </strong>
        </div>

        <div className="entrepreneur-profile-item">
          <span className="entrepreneur-profile-item__label">نوع رائد الأعمال</span>
          <strong className="entrepreneur-profile-item__value">
            {renderValue(profile.entrepreneurType)}
          </strong>
        </div>

        <div className="entrepreneur-profile-item">
          <span className="entrepreneur-profile-item__label">اسم الجهة أو الشركة</span>
          <strong className="entrepreneur-profile-item__value">
            {renderValue(profile.organizationName)}
          </strong>
        </div>

        <div className="entrepreneur-profile-item">
          <span className="entrepreneur-profile-item__label">المدينة</span>
          <strong className="entrepreneur-profile-item__value">
            {renderValue(profile.city)}
          </strong>
        </div>

        <div className="entrepreneur-profile-item">
          <span className="entrepreneur-profile-item__label">الدولة</span>
          <strong className="entrepreneur-profile-item__value">
            {renderValue(profile.country)}
          </strong>
        </div>

        <div className="entrepreneur-profile-item">
          <span className="entrepreneur-profile-item__label">الموقع الإلكتروني</span>
          {profile.websiteUrl ? (
            <a
              className="entrepreneur-profile-item__link"
              href={profile.websiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              {profile.websiteUrl}
            </a>
          ) : (
            <strong className="entrepreneur-profile-item__value">غير متوفر</strong>
          )}
        </div>

        <div className="entrepreneur-profile-item">
          <span className="entrepreneur-profile-item__label">لينكدإن</span>
          {profile.linkedinUrl ? (
            <a
              className="entrepreneur-profile-item__link"
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              {profile.linkedinUrl}
            </a>
          ) : (
            <strong className="entrepreneur-profile-item__value">غير متوفر</strong>
          )}
        </div>
      </div>

      <div className="entrepreneur-profile-card__bio">
        <span className="entrepreneur-profile-item__label">النبذة التعريفية</span>
        <p className="entrepreneur-profile-card__bio-text">{renderValue(profile.bio)}</p>
      </div>
    </div>
  );
}