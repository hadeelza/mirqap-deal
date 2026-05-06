import { useEffect, useState } from "react";
import EntrepreneurProfileCard from "../components/EntrepreneurProfileCard";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";

type EntrepreneurProfileRow = {
  entrepreneur_type: "individual" | "team" | "company" | "institution" | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  organization_name: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type EntrepreneurProfileViewModel = {
  fullName: string;
  email: string;
  phone: string;
  entrepreneurType: string;
  bio: string;
  city: string;
  country: string;
  organizationName: string;
  websiteUrl: string;
  linkedinUrl: string;
};

function mapEntrepreneurTypeLabel(value: string | null | undefined) {
  switch (value) {
    case "individual":
      return "فردي";
    case "team":
      return "فريق";
    case "company":
      return "شركة";
    case "institution":
      return "مؤسسة";
    default:
      return "غير محدد";
  }
}

export default function EntrepreneurProfilePage() {
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [profile, setProfile] = useState<EntrepreneurProfileViewModel | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!appUser) {
        setIsLoadingPage(false);
        return;
      }

      try {
        setIsLoadingPage(true);
        setErrorMessage("");

        const response = await supabase
          .from("entrepreneur_profiles")
          .select(
            "entrepreneur_type, bio, city, country, organization_name, website_url, linkedin_url"
          )
          .eq("user_id", appUser.id)
          .maybeSingle();

        if (response.error) {
          throw new Error(response.error.message);
        }

        const row = (response.data ?? null) as EntrepreneurProfileRow | null;

        setProfile({
          fullName: appUser.full_name ?? "",
          email: appUser.email ?? "",
          phone: appUser.phone ?? "",
          entrepreneurType: mapEntrepreneurTypeLabel(row?.entrepreneur_type),
          bio: row?.bio ?? "",
          city: row?.city ?? "",
          country: row?.country ?? "",
          organizationName: row?.organization_name ?? "",
          websiteUrl: row?.website_url ?? "",
          linkedinUrl: row?.linkedin_url ?? "",
        });
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "تعذر تحميل بيانات الملف الشخصي."
        );
      } finally {
        setIsLoadingPage(false);
      }
    }

    void loadProfile();
  }, [appUser]);

  if (isAuthLoading || isLoadingPage) {
    return <div className="panel-loading-screen">جاري تحميل الملف الشخصي...</div>;
  }

  if (!appUser) {
    return <div className="panel-loading-screen">تعذر العثور على المستخدم الحالي.</div>;
  }

  if (errorMessage) {
    return <div className="panel-error-box">{errorMessage}</div>;
  }

  if (!profile) {
    return <div className="panel-empty-box">لا توجد بيانات متاحة حالياً.</div>;
  }

  return (
    <section className="entrepreneur-profile-page">
      <div className="panel-page-heading">
        <div>
          <h2 className="panel-page-heading__title">الملف الشخصي</h2>
          <p className="panel-page-heading__subtitle">
            عرض بيانات رائد الأعمال الأساسية بشكل منظم وواضح.
          </p>
        </div>
      </div>

      <EntrepreneurProfileCard profile={profile} />
    </section>
  );
}