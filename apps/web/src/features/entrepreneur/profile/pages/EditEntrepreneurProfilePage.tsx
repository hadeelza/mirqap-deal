import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import EditEntrepreneurProfileForm, {
  type EditEntrepreneurProfileFormValues,
} from "../components/EditEntrepreneurProfileForm";

type EntrepreneurProfileRow = {
  entrepreneur_type: "individual" | "team" | "company" | "institution" | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  organization_name: string | null;
  website_url: string | null;
  linkedin_url: string | null;
};

const initialValues: EditEntrepreneurProfileFormValues = {
  fullName: "",
  phone: "",
  entrepreneurType: "individual",
  bio: "",
  city: "",
  country: "",
  organizationName: "",
  websiteUrl: "",
  linkedinUrl: "",
};

export default function EditEntrepreneurProfilePage() {
  const navigate = useNavigate();
  const { appUser, isLoading: isAuthLoading, refreshAppUser } = useAuthUser();

  const [values, setValues] = useState<EditEntrepreneurProfileFormValues>(initialValues);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!appUser) {
        setIsLoadingPage(false);
        return;
      }

      try {
        setIsLoadingPage(true);
        setErrorMessage("");

        const profileResponse = await supabase
          .from("entrepreneur_profiles")
          .select(
            "entrepreneur_type, bio, city, country, organization_name, website_url, linkedin_url"
          )
          .eq("user_id", appUser.id)
          .maybeSingle();

        if (profileResponse.error) {
          throw new Error(profileResponse.error.message);
        }

        const profile = (profileResponse.data ?? null) as EntrepreneurProfileRow | null;

        setValues({
          fullName: appUser.full_name ?? "",
          phone: appUser.phone ?? "",
          entrepreneurType: profile?.entrepreneur_type ?? "individual",
          bio: profile?.bio ?? "",
          city: profile?.city ?? "",
          country: profile?.country ?? "",
          organizationName: profile?.organization_name ?? "",
          websiteUrl: profile?.website_url ?? "",
          linkedinUrl: profile?.linkedin_url ?? "",
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

  async function handleSubmit(formValues: EditEntrepreneurProfileFormValues) {
    if (!appUser) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const updateUserResponse = await supabase
        .from("users")
        .update({
          full_name: formValues.fullName.trim(),
          phone: formValues.phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", appUser.id);

      if (updateUserResponse.error) {
        throw new Error(updateUserResponse.error.message);
      }

      const upsertProfileResponse = await supabase.from("entrepreneur_profiles").upsert(
        {
          user_id: appUser.id,
          entrepreneur_type: formValues.entrepreneurType,
          bio: formValues.bio.trim() || null,
          city: formValues.city.trim() || null,
          country: formValues.country.trim() || null,
          organization_name: formValues.organizationName.trim() || null,
          website_url: formValues.websiteUrl.trim() || null,
          linkedin_url: formValues.linkedinUrl.trim() || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (upsertProfileResponse.error) {
        throw new Error(upsertProfileResponse.error.message);
      }

      await refreshAppUser();
      setSuccessMessage("تم حفظ التعديلات بنجاح.");

      window.setTimeout(() => {
        navigate(ROUTES.entrepreneur.profile, { replace: true });
      }, 700);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "تعذر حفظ التعديلات حالياً.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || isLoadingPage) {
    return <div className="panel-loading-screen">جاري تحميل بيانات الملف الشخصي...</div>;
  }

  if (!appUser) {
    return <div className="panel-loading-screen">تعذر العثور على المستخدم الحالي.</div>;
  }

  return (
    <section className="entrepreneur-profile-page">
      <div className="panel-page-heading">
        <div>
          <h2 className="panel-page-heading__title">تعديل الملف الشخصي</h2>
          <p className="panel-page-heading__subtitle">
            عدّل بياناتك الأساسية ثم احفظ التغييرات.
          </p>
        </div>

        <Link to={ROUTES.entrepreneur.profile} className="entrepreneur-profile-back-btn">
          العودة للملف الشخصي
        </Link>
      </div>

      {errorMessage ? <div className="panel-error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="panel-success-box">{successMessage}</div> : null}

      <EditEntrepreneurProfileForm
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}