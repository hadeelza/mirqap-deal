import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../../core/hooks/useAuthUser";
import type {
  CompleteEntrepreneurProfileValues,
  CompleteInvestorProfileValues,
} from "../../../core/types/auth.types";
import {
  getEntrepreneurProfile,
  getInvestorProfile,
} from "../../../lib/supabase/queries/users.queries";
import {
  completeEntrepreneurProfileService,
  completeInvestorProfileService,
  getPostAuthRedirect,
} from "../services/auth.service";

const entrepreneurInitial: CompleteEntrepreneurProfileValues = {
  phone: "",
  entrepreneurType: "individual",
  bio: "",
  city: "",
  country: "",
  organizationName: "",
  websiteUrl: "",
  linkedinUrl: "",
};

const investorInitial: CompleteInvestorProfileValues = {
  phone: "",
  investorType: "individual",
  organizationName: "",
  bio: "",
  websiteUrl: "",
  linkedinUrl: "",
  profileVisibility: "private",
  isDiscoverable: true,
};

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { appUser, isLoading } = useAuthUser();

  const [entrepreneurValues, setEntrepreneurValues] = useState(entrepreneurInitial);
  const [investorValues, setInvestorValues] = useState(investorInitial);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const roleLabel = useMemo(() => {
    if (appUser?.role === "entrepreneur") return "رائد أعمال";
    if (appUser?.role === "investor") return "مستثمر";
    return "مستخدم";
  }, [appUser?.role]);

  useEffect(() => {
    async function bootstrap() {
      if (!appUser) {
        setIsBootstrapping(false);
        return;
      }

      if (appUser.account_status === "active") {
        const redirectTo = await getPostAuthRedirect(appUser.id);
        navigate(redirectTo, { replace: true });
        return;
      }

      try {
        if (appUser.role === "entrepreneur") {
          const profile = await getEntrepreneurProfile(appUser.id);

          setEntrepreneurValues({
            phone: appUser.phone ?? "",
            entrepreneurType: profile?.entrepreneur_type ?? "individual",
            bio: profile?.bio ?? "",
            city: profile?.city ?? "",
            country: profile?.country ?? "",
            organizationName: profile?.organization_name ?? "",
            websiteUrl: profile?.website_url ?? "",
            linkedinUrl: profile?.linkedin_url ?? "",
          });
        }

        if (appUser.role === "investor") {
          const profile = await getInvestorProfile(appUser.id);

          setInvestorValues({
            phone: appUser.phone ?? "",
            investorType: profile?.investor_type ?? "individual",
            organizationName: profile?.organization_name ?? "",
            bio: profile?.bio ?? "",
            websiteUrl: profile?.website_url ?? "",
            linkedinUrl: profile?.linkedin_url ?? "",
            profileVisibility: profile?.profile_visibility ?? "private",
            isDiscoverable: profile?.is_discoverable ?? true,
          });
        }
      } finally {
        setIsBootstrapping(false);
      }
    }

    void bootstrap();
  }, [appUser, navigate]);

  // async function handleEntrepreneurSubmit() {
  //   if (!appUser) {
  //     return;
  //   }

  //   try {
  //     setErrorMessage("");
  //     setIsSubmitting(true);

  //     const redirectTo = await completeEntrepreneurProfileService(appUser.id, entrepreneurValues);
  //     await refreshAppUser();
  //     navigate(redirectTo, { replace: true });
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : "تعذر حفظ بيانات الملف الشخصي.";
  //     setErrorMessage(message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }



  async function handleEntrepreneurSubmit() {
    if (!appUser) {
      return;
    }
  
    try {
      setErrorMessage("");
      setIsSubmitting(true);
  
      const redirectTo = await completeEntrepreneurProfileService(appUser, entrepreneurValues);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر حفظ بيانات الملف الشخصي.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // async function handleInvestorSubmit() {
  //   if (!appUser) {
  //     return;
  //   }

  //   try {
  //     setErrorMessage("");
  //     setIsSubmitting(true);

  //     const redirectTo = await completeInvestorProfileService(appUser, investorValues);
  //     await refreshAppUser();
  //     navigate(redirectTo, { replace: true });
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : "تعذر حفظ بيانات الملف الشخصي.";
  //     setErrorMessage(message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }

  async function handleInvestorSubmit() {
    if (!appUser) {
      return;
    }
  
    try {
      setErrorMessage("");
      setIsSubmitting(true);
  
      const redirectTo = await completeInvestorProfileService(appUser, investorValues);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر حفظ بيانات الملف الشخصي.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isBootstrapping) {
    return <div className="auth-loader">جاري تحميل بيانات الملف الشخصي...</div>;
  }

  if (!appUser) {
    return <div className="auth-loader">تعذر العثور على المستخدم الحالي.</div>;
  }

  return (
    <section className="complete-profile-page container">
      <div className="complete-profile__hero">
        <div>
          <span className="complete-profile__eyebrow">الخطوة الأخيرة</span>
          <h1 className="complete-profile__hero-title">إكمال الملف الشخصي</h1>
          <p className="complete-profile__hero-text">
            أضف بياناتك الأساسية حتى يتم تفعيل الحساب ونقلك تلقائياً إلى المسار المناسب داخل منصة صفقة بمرقاب.
          </p>
        </div>

        <div className="complete-profile__role-pill">{roleLabel}</div>
      </div>

      <div className="complete-profile__layout">
        <aside className="complete-profile__summary">
          <div className="complete-profile__summary-card">
            <h2>مراجعة سريعة</h2>

            <div className="complete-profile__summary-list">
              <div className="complete-profile__summary-item">
                <span>الاسم</span>
                <strong>{appUser.full_name}</strong>
              </div>

              <div className="complete-profile__summary-item">
                <span>البريد الإلكتروني</span>
                <strong>{appUser.email}</strong>
              </div>

              <div className="complete-profile__summary-item">
                <span>نوع الحساب</span>
                <strong>{roleLabel}</strong>
              </div>

              <div className="complete-profile__summary-item">
                <span>حالة الحساب</span>
                <strong>{appUser.account_status === "pending" ? "بانتظار الإكمال" : appUser.account_status}</strong>
              </div>
            </div>
          </div>

          <div className="complete-profile__tips-card">
            <h3>ما المطلوب الآن؟</h3>
            <ul>
              <li>إضافة بيانات التواصل الأساسية</li>
              <li>إكمال معلومات الجهة أو النشاط</li>
              <li>كتابة نبذة تعريفية واضحة</li>
              <li>حفظ البيانات للانتقال للوحة المناسبة</li>
            </ul>
          </div>
        </aside>

        {appUser.role === "entrepreneur" ? (
          <form
            className="complete-profile__form-card"
            onSubmit={(event) => {
              event.preventDefault();
              void handleEntrepreneurSubmit();
            }}
          >
            <div className="complete-profile__section">
              <h2 className="complete-profile__section-title">البيانات الأساسية</h2>

              <div className="complete-profile__fields">
                <div className="complete-profile__field">
                  <label htmlFor="entrepreneur-phone">رقم الجوال</label>
                  <input
                    id="entrepreneur-phone"
                    value={entrepreneurValues.phone}
                    onChange={(event) =>
                      setEntrepreneurValues((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="complete-profile__field">
                  <label htmlFor="entrepreneur-type">نوع الحساب</label>
                  <select
                    id="entrepreneur-type"
                    value={entrepreneurValues.entrepreneurType}
                    onChange={(event) =>
                      setEntrepreneurValues((current) => ({
                        ...current,
                        entrepreneurType:
                          event.target.value as CompleteEntrepreneurProfileValues["entrepreneurType"],
                      }))
                    }
                  >
                    <option value="individual">فردي</option>
                    <option value="team">فريق</option>
                    <option value="company">شركة</option>
                    <option value="institution">مؤسسة</option>
                  </select>
                </div>

                <div className="complete-profile__field">
                  <label htmlFor="entrepreneur-city">المدينة</label>
                  <input
                    id="entrepreneur-city"
                    value={entrepreneurValues.city}
                    onChange={(event) =>
                      setEntrepreneurValues((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="complete-profile__field">
                  <label htmlFor="entrepreneur-country">الدولة</label>
                  <input
                    id="entrepreneur-country"
                    value={entrepreneurValues.country}
                    onChange={(event) =>
                      setEntrepreneurValues((current) => ({
                        ...current,
                        country: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="complete-profile__field complete-profile__field--full">
                  <label htmlFor="entrepreneur-org">اسم الجهة أو الشركة</label>
                  <input
                    id="entrepreneur-org"
                    value={entrepreneurValues.organizationName}
                    onChange={(event) =>
                      setEntrepreneurValues((current) => ({
                        ...current,
                        organizationName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="complete-profile__section">
              <h2 className="complete-profile__section-title">الروابط والنبذة</h2>

              <div className="complete-profile__fields">
                <div className="complete-profile__field">
                  <label htmlFor="entrepreneur-website">رابط الموقع</label>
                  <input
                    id="entrepreneur-website"
                    value={entrepreneurValues.websiteUrl}
                    onChange={(event) =>
                      setEntrepreneurValues((current) => ({
                        ...current,
                        websiteUrl: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="complete-profile__field">
                  <label htmlFor="entrepreneur-linkedin">رابط لينكدإن</label>
                  <input
                    id="entrepreneur-linkedin"
                    value={entrepreneurValues.linkedinUrl}
                    onChange={(event) =>
                      setEntrepreneurValues((current) => ({
                        ...current,
                        linkedinUrl: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="complete-profile__field complete-profile__field--full">
                  <label htmlFor="entrepreneur-bio">نبذة تعريفية</label>
                  <textarea
                    id="entrepreneur-bio"
                    rows={6}
                    value={entrepreneurValues.bio}
                    onChange={(event) =>
                      setEntrepreneurValues((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

            <div className="complete-profile__actions">
              <button className="btn btn--primary auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الحفظ..." : "حفظ وإكمال الحساب"}
              </button>
            </div>
          </form>
        ) : null}

        {appUser.role === "investor" ? (
          <form
            className="complete-profile__form-card"
            onSubmit={(event) => {
              event.preventDefault();
              void handleInvestorSubmit();
            }}
          >
            <div className="complete-profile__section">
              <h2 className="complete-profile__section-title">البيانات الأساسية</h2>

              <div className="complete-profile__fields">
                <div className="complete-profile__field">
                  <label htmlFor="investor-phone">رقم الجوال</label>
                  <input
                    id="investor-phone"
                    value={investorValues.phone}
                    onChange={(event) =>
                      setInvestorValues((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="complete-profile__field">
                  <label htmlFor="investor-type">نوع المستثمر</label>
                  <select
                    id="investor-type"
                    value={investorValues.investorType}
                    onChange={(event) =>
                      setInvestorValues((current) => ({
                        ...current,
                        investorType: event.target.value as CompleteInvestorProfileValues["investorType"],
                      }))
                    }
                  >
                    <option value="angel">ملاك</option>
                    <option value="individual">فردي</option>
                    <option value="institution">مؤسسة</option>
                    <option value="incubator">حاضنة</option>
                    <option value="accelerator">مسرعة</option>
                  </select>
                </div>

                <div className="complete-profile__field complete-profile__field--full">
                  <label htmlFor="investor-org">اسم الجهة</label>
                  <input
                    id="investor-org"
                    value={investorValues.organizationName}
                    onChange={(event) =>
                      setInvestorValues((current) => ({
                        ...current,
                        organizationName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="complete-profile__field">
                  <label htmlFor="investor-visibility">إظهار الملف</label>
                  <select
                    id="investor-visibility"
                    value={investorValues.profileVisibility}
                    onChange={(event) =>
                      setInvestorValues((current) => ({
                        ...current,
                        profileVisibility:
                          event.target.value as CompleteInvestorProfileValues["profileVisibility"],
                      }))
                    }
                  >
                    <option value="private">خاص</option>
                    <option value="public">عام</option>
                  </select>
                </div>

                <div className="complete-profile__field">
                  <label htmlFor="investor-website">رابط الموقع</label>
                  <input
                    id="investor-website"
                    value={investorValues.websiteUrl}
                    onChange={(event) =>
                      setInvestorValues((current) => ({
                        ...current,
                        websiteUrl: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="complete-profile__field">
                  <label htmlFor="investor-linkedin">رابط لينكدإن</label>
                  <input
                    id="investor-linkedin"
                    value={investorValues.linkedinUrl}
                    onChange={(event) =>
                      setInvestorValues((current) => ({
                        ...current,
                        linkedinUrl: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="complete-profile__field complete-profile__field--full">
                  <label htmlFor="investor-bio">نبذة تعريفية</label>
                  <textarea
                    id="investor-bio"
                    rows={6}
                    value={investorValues.bio}
                    onChange={(event) =>
                      setInvestorValues((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="complete-profile__section">
              <h2 className="complete-profile__section-title">إعدادات الظهور</h2>

              <label className="complete-profile__toggle">
                <input
                  type="checkbox"
                  checked={investorValues.isDiscoverable}
                  onChange={(event) =>
                    setInvestorValues((current) => ({
                      ...current,
                      isDiscoverable: event.target.checked,
                    }))
                  }
                />
                <span>أريد أن أكون قابلاً للاكتشاف داخل المنصة</span>
              </label>
            </div>

            {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

            <div className="complete-profile__actions">
              <button className="btn btn--primary auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الحفظ..." : "حفظ وإكمال الحساب"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );

}