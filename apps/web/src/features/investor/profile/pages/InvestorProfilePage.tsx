import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import { supabase } from "../../../../lib/supabase/client";
import InvestorProfileCard from "../components/InvestorProfileCard";
import InvestorVisibilityCard from "../components/InvestorVisibilityCard";

type InvestorType = "angel" | "individual" | "institution" | "incubator" | "accelerator";

interface InvestorProfileRow {
  user_id: string;
  investor_type: InvestorType | null;
  organization_name: string | null;
  bio: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  is_discoverable: boolean | null;
}

const EDIT_PROFILE_PATH = "/investor/profile/edit";

export default function InvestorProfilePage() {
  const { appUser, isLoading } = useAuthUser();

  const [profile, setProfile] = useState<InvestorProfileRow | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadInvestorProfile() {
      if (!appUser?.id) {
        setIsBootstrapping(false);
        return;
      }

      try {
        setErrorMessage("");

        const { data, error } = await supabase
          .from("investor_profiles")
          .select(
            "user_id, investor_type, organization_name, bio, website_url, linkedin_url, is_discoverable"
          )
          .eq("user_id", appUser.id)
          .maybeSingle<InvestorProfileRow>();

        if (error) {
          throw error;
        }

        setProfile(data ?? null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل بيانات الملف الشخصي حالياً.";
        setErrorMessage(message);
      } finally {
        setIsBootstrapping(false);
      }
    }

    void loadInvestorProfile();
  }, [appUser?.id]);

  if (isLoading || isBootstrapping) {
    return (
      <section className="investor-profile-page">
        <div className="investor-profile-state">جاري تحميل الملف الشخصي...</div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-profile-page">
        <div className="investor-profile-state investor-profile-state--error">
          تعذر تحميل بيانات الحساب.
        </div>
      </section>
    );
  }

  if (appUser.role !== "investor") {
    return (
      <section className="investor-profile-page">
        <div className="investor-profile-state investor-profile-state--error">
          الصفحة غير متاحة لهذا النوع من الحسابات.
        </div>
      </section>
    );
  }

  return (
    <section className="investor-profile-page">
      <div className="investor-profile-page__header">
        <div>
          <span className="investor-profile-page__eyebrow">Investor Profile</span>
          <h1 className="investor-profile-page__title">الملف الشخصي</h1>
          <p className="investor-profile-page__subtitle">
            عرض المعلومات الأساسية للحساب والجهة الاستثمارية وإعدادات الاكتشاف داخل المنصة.
          </p>
        </div>

        <div className="investor-profile-page__actions">
          <Link to={EDIT_PROFILE_PATH} className="btn btn--primary">
            تعديل الملف
          </Link>

          <Link to={ROUTES.investor.preferences} className="btn btn--ghost">
            التفضيلات
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="investor-profile-alert investor-profile-alert--error">{errorMessage}</div>
      ) : null}

      {!profile ? (
        <div className="investor-profile-alert">
          لا توجد بيانات تفصيلية محفوظة في ملف المستثمر.
        </div>
      ) : null}

      <div className="investor-profile-grid">
        <InvestorProfileCard
          fullName={appUser.full_name}
          email={appUser.email}
          phone={appUser.phone}
          avatarUrl={appUser.avatar_url}
          accountStatus={appUser.account_status}
          isVerified={appUser.is_verified}
          investorType={profile?.investor_type ?? null}
          organizationName={profile?.organization_name ?? null}
          bio={profile?.bio ?? null}
          websiteUrl={profile?.website_url ?? null}
          linkedinUrl={profile?.linkedin_url ?? null}
        />

        <InvestorVisibilityCard isDiscoverable={profile?.is_discoverable ?? false} />
      </div>
    </section>
  );
}