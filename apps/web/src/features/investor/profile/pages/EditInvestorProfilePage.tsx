import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import { supabase } from "../../../../lib/supabase/client";
import EditInvestorProfileForm, {
  type EditInvestorProfileFormValues,
} from "../components/EditInvestorProfileForm";

interface InvestorProfileRow {
  user_id: string;
  organization_name: string | null;
  bio: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  is_discoverable: boolean | null;
}

export default function EditInvestorProfilePage() {
  const navigate = useNavigate();
  const { appUser, isLoading, refreshAppUser } = useAuthUser();

  const [initialValues, setInitialValues] = useState<EditInvestorProfileFormValues | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!appUser?.id) {
        setIsBootstrapping(false);
        return;
      }

      try {
        setErrorMessage("");

        const { data, error } = await supabase
          .from("investor_profiles")
          .select("user_id, organization_name, bio, website_url, linkedin_url, is_discoverable")
          .eq("user_id", appUser.id)
          .maybeSingle<InvestorProfileRow>();

        if (error) {
          throw error;
        }

        setInitialValues({
          fullName: appUser.full_name ?? "",
          phone: appUser.phone ?? "",
          organizationName: data?.organization_name ?? "",
          bio: data?.bio ?? "",
          websiteUrl: data?.website_url ?? "",
          linkedinUrl: data?.linkedin_url ?? "",
          isDiscoverable: data?.is_discoverable ?? true,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل بيانات الملف الشخصي حالياً.";
        setErrorMessage(message);
      } finally {
        setIsBootstrapping(false);
      }
    }

    void loadProfile();
  }, [appUser]);

  async function handleSubmit(values: EditInvestorProfileFormValues) {
    if (!appUser?.id) {
      setErrorMessage("تعذر العثور على بيانات الحساب.");
      return;
    }

    try {
      setErrorMessage("");
      setIsSubmitting(true);

      const now = new Date().toISOString();

      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: values.fullName.trim(),
          phone: values.phone.trim() || null,
          updated_at: now,
        })
        .eq("id", appUser.id);

      if (userError) {
        throw userError;
      }

      const { error: profileError } = await supabase.from("investor_profiles").upsert(
        {
          user_id: appUser.id,
          organization_name: values.organizationName.trim() || null,
          bio: values.bio.trim() || null,
          website_url: values.websiteUrl.trim() || null,
          linkedin_url: values.linkedinUrl.trim() || null,
          is_discoverable: values.isDiscoverable,
          updated_at: now,
        },
        {
          onConflict: "user_id",
        }
      );

      if (profileError) {
        throw profileError;
      }

      await refreshAppUser();
      navigate(ROUTES.investor.profile, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "تعذر حفظ التعديلات حالياً.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isBootstrapping) {
    return (
      <section className="investor-edit-profile-page">
        <div className="investor-profile-state">جاري تحميل بيانات التعديل...</div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-edit-profile-page">
        <div className="investor-profile-state investor-profile-state--error">
          تعذر تحميل بيانات الحساب.
        </div>
      </section>
    );
  }

  if (appUser.role !== "investor") {
    return (
      <section className="investor-edit-profile-page">
        <div className="investor-profile-state investor-profile-state--error">
          الصفحة غير متاحة لهذا النوع من الحسابات.
        </div>
      </section>
    );
  }

  if (!initialValues) {
    return (
      <section className="investor-edit-profile-page">
        <div className="investor-profile-state investor-profile-state--error">
          لا يمكن عرض نموذج التعديل حالياً.
        </div>
      </section>
    );
  }

  return (
    <section className="investor-edit-profile-page">
      <div className="investor-edit-profile-page__header">
        <div>
          <span className="investor-edit-profile-page__eyebrow">Edit Profile</span>
          <h1 className="investor-edit-profile-page__title">تعديل الملف الشخصي</h1>
          <p className="investor-edit-profile-page__subtitle">
            تحديث المعلومات الأساسية للحساب والجهة الاستثمارية وروابط التعريف.
          </p>
        </div>

        <div className="investor-edit-profile-page__actions">
          <Link to={ROUTES.investor.dashboard} className="btn btn--ghost">
            لوحة التحكم
          </Link>
          <Link to={ROUTES.investor.profile} className="btn btn--secondary">
            الرجوع للملف
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="investor-profile-alert investor-profile-alert--error">{errorMessage}</div>
      ) : null}

      <EditInvestorProfileForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </section>
  );
}