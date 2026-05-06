import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import { supabase } from "../../../../lib/supabase/client";
import PreferenceCategoriesSection from "../components/PreferenceCategoriesSection";
import PreferenceStagesSection from "../components/PreferenceStagesSection";
import PreferenceRiskSection from "../components/PreferenceRiskSection";
import PreferenceTechnologiesSection from "../components/PreferenceTechnologiesSection";
import TicketRangeSection from "../components/TicketRangeSection";

type StartupStage = "idea" | "mvp_seed";
type RiskLevel = "low" | "medium" | "high";

interface CategoryOption {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

interface TechnologyOption {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

interface InvestorPreferenceRow {
  investor_id: string;
  min_ticket_sar: number | null;
  max_ticket_sar: number | null;
  updated_at: string | null;
}

interface InvestorPreferenceCategoryRow {
  category_id: string | null;
}

interface InvestorPreferenceStageRow {
  startup_stage: StartupStage | null;
}

interface InvestorPreferenceRiskRow {
  risk_level: RiskLevel | null;
}

interface InvestorPreferenceTechnologyRow {
  technology_id: string | null;
}

export default function InvestorPreferencesPage() {
  const { appUser, isLoading } = useAuthUser();

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [technologyOptions, setTechnologyOptions] = useState<TechnologyOption[]>([]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<StartupStage[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([]);
  const [selectedTechnologyIds, setSelectedTechnologyIds] = useState<string[]>([]);
  const [minTicketSar, setMinTicketSar] = useState("");
  const [maxTicketSar, setMaxTicketSar] = useState("");

  useEffect(() => {
    async function loadPreferences() {
      if (!appUser?.id) {
        setIsBootstrapping(false);
        return;
      }

      try {
        setErrorMessage("");
        setSuccessMessage("");

        const [
          categoriesResponse,
          technologiesResponse,
          preferencesResponse,
          preferenceCategoriesResponse,
          preferenceStagesResponse,
          preferenceRiskLevelsResponse,
          preferenceTechnologiesResponse,
        ] = await Promise.all([
          supabase
            .from("project_categories")
            .select("id, name_ar, name_en, is_active")
            .eq("is_active", true)
            .order("name_ar", { ascending: true }),
            supabase
            .from("technologies")
            .select("id, name_ar, name_en, is_active")
            .eq("is_active", true)
            .order("name_ar", { ascending: true }),
          supabase
            .from("investor_preferences")
            .select("investor_id, min_ticket_sar, max_ticket_sar, updated_at")
            .eq("investor_id", appUser.id)
            .maybeSingle(),
            supabase
            .from("investor_preference_categories")
            .select("category_id")
            .eq("investor_id", appUser.id),
            supabase
            .from("investor_preference_stages")
            .select("startup_stage")
            .eq("investor_id", appUser.id),
            supabase
            .from("investor_preference_risk_levels")
            .select("risk_level")
            .eq("investor_id", appUser.id),
            supabase
            .from("investor_preference_technologies")
            .select("technology_id")
            .eq("investor_id", appUser.id),
        ]);

        if (categoriesResponse.error) {
          throw categoriesResponse.error;
        }

        if (technologiesResponse.error) {
          throw technologiesResponse.error;
        }

        if (preferencesResponse.error) {
          throw preferencesResponse.error;
        }

        if (preferenceCategoriesResponse.error) {
          throw preferenceCategoriesResponse.error;
        }

        if (preferenceStagesResponse.error) {
          throw preferenceStagesResponse.error;
        }

        if (preferenceRiskLevelsResponse.error) {
          throw preferenceRiskLevelsResponse.error;
        }

        if (preferenceTechnologiesResponse.error) {
          throw preferenceTechnologiesResponse.error;
        }

        const categories = (categoriesResponse.data ?? []) as CategoryOption[];
        const technologies = (technologiesResponse.data ?? []) as TechnologyOption[];
        const preference = (preferencesResponse.data ?? null) as InvestorPreferenceRow | null;
        const preferenceCategories = (
          preferenceCategoriesResponse.data ?? []
        ) as InvestorPreferenceCategoryRow[];
        const preferenceStages = (
          preferenceStagesResponse.data ?? []
        ) as InvestorPreferenceStageRow[];
        const preferenceRiskLevels = (
          preferenceRiskLevelsResponse.data ?? []
        ) as InvestorPreferenceRiskRow[];
        const preferenceTechnologies = (
          preferenceTechnologiesResponse.data ?? []
        ) as InvestorPreferenceTechnologyRow[];

        setCategoryOptions(categories);
        setTechnologyOptions(technologies);

        setSelectedCategoryIds(
          preferenceCategories
            .map((item: InvestorPreferenceCategoryRow) => item.category_id)
            .filter((value): value is string => Boolean(value))
        );

        setSelectedStages(
          preferenceStages
            .map((item: InvestorPreferenceStageRow) => item.startup_stage)
            .filter((value): value is StartupStage => Boolean(value))
        );

        setSelectedRiskLevels(
          preferenceRiskLevels
            .map((item: InvestorPreferenceRiskRow) => item.risk_level)
            .filter((value): value is RiskLevel => Boolean(value))
        );

        setSelectedTechnologyIds(
          preferenceTechnologies
            .map((item: InvestorPreferenceTechnologyRow) => item.technology_id)
            .filter((value): value is string => Boolean(value))
        );

        setMinTicketSar(
          preference?.min_ticket_sar !== null && preference?.min_ticket_sar !== undefined
            ? String(preference.min_ticket_sar)
            : ""
        );

        setMaxTicketSar(
          preference?.max_ticket_sar !== null && preference?.max_ticket_sar !== undefined
            ? String(preference.max_ticket_sar)
            : ""
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل التفضيلات حالياً.";
        setErrorMessage(message);
      } finally {
        setIsBootstrapping(false);
      }
    }

    void loadPreferences();
  }, [appUser]);

  const selectedCountsLabel = useMemo(() => {
    return [
      `${selectedCategoryIds.length} قطاعات`,
      `${selectedStages.length} مراحل`,
      `${selectedRiskLevels.length} مستويات مخاطرة`,
      `${selectedTechnologyIds.length} تقنيات`,
    ].join(" • ");
  }, [selectedCategoryIds, selectedStages, selectedRiskLevels, selectedTechnologyIds]);

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  function toggleStage(stage: StartupStage) {
    setSelectedStages((current) =>
      current.includes(stage) ? current.filter((item) => item !== stage) : [...current, stage]
    );
  }

  function toggleRiskLevel(riskLevel: RiskLevel) {
    setSelectedRiskLevels((current) =>
      current.includes(riskLevel)
        ? current.filter((item) => item !== riskLevel)
        : [...current, riskLevel]
    );
  }

  function toggleTechnology(technologyId: string) {
    setSelectedTechnologyIds((current) =>
      current.includes(technologyId)
        ? current.filter((id) => id !== technologyId)
        : [...current, technologyId]
    );
  }

  async function handleSave() {
    if (!appUser?.id) {
      setErrorMessage("تعذر العثور على بيانات المستثمر الحالية.");
      return;
    }

    const normalizedMin = minTicketSar.trim() === "" ? null : Number(minTicketSar);
    const normalizedMax = maxTicketSar.trim() === "" ? null : Number(maxTicketSar);

    if (normalizedMin !== null && Number.isNaN(normalizedMin)) {
      setErrorMessage("الحد الأدنى للتذكرة الاستثمارية غير صحيح.");
      return;
    }

    if (normalizedMax !== null && Number.isNaN(normalizedMax)) {
      setErrorMessage("الحد الأعلى للتذكرة الاستثمارية غير صحيح.");
      return;
    }

    if (normalizedMin !== null && normalizedMin < 0) {
      setErrorMessage("الحد الأدنى يجب أن يكون صفراً أو أكبر.");
      return;
    }

    if (normalizedMax !== null && normalizedMax < 0) {
      setErrorMessage("الحد الأعلى يجب أن يكون صفراً أو أكبر.");
      return;
    }

    if (normalizedMin !== null && normalizedMax !== null && normalizedMin > normalizedMax) {
      setErrorMessage("الحد الأدنى لا يمكن أن يكون أكبر من الحد الأعلى.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const now = new Date().toISOString();

      const { error: preferenceError } = await supabase.from("investor_preferences").upsert(
        {
          investor_id: appUser.id,
          min_ticket_sar: normalizedMin,
          max_ticket_sar: normalizedMax,
          updated_at: now,
        },
        {
          onConflict: "investor_id",
        }
      );

      if (preferenceError) {
        throw preferenceError;
      }

      const [
        deleteCategoriesResponse,
        deleteStagesResponse,
        deleteRiskLevelsResponse,
        deleteTechnologiesResponse,
      ] = await Promise.all([
        supabase
          .from("investor_preference_categories")
          .delete()
          .eq("investor_id", appUser.id),
          supabase
          .from("investor_preference_stages")
          .delete()
          .eq("investor_id", appUser.id),
          supabase
          .from("investor_preference_risk_levels")
          .delete()
          .eq("investor_id", appUser.id),
          supabase
          .from("investor_preference_technologies")
          .delete()
          .eq("investor_id", appUser.id),
      ]);

      if (deleteCategoriesResponse.error) {
        throw deleteCategoriesResponse.error;
      }

      if (deleteStagesResponse.error) {
        throw deleteStagesResponse.error;
      }

      if (deleteRiskLevelsResponse.error) {
        throw deleteRiskLevelsResponse.error;
      }

      if (deleteTechnologiesResponse.error) {
        throw deleteTechnologiesResponse.error;
      }

      if (selectedCategoryIds.length > 0) {
        const { error } = await supabase.from("investor_preference_categories").insert(
          selectedCategoryIds.map((categoryId: string) => ({
            investor_id: appUser.id,
            category_id: categoryId,
          }))
        );

        if (error) {
          throw error;
        }
      }

      if (selectedStages.length > 0) {
        const { error } = await supabase.from("investor_preference_stages").insert(
          selectedStages.map((stage: StartupStage) => ({
            investor_id: appUser.id,
            startup_stage: stage,
          }))
        );

        if (error) {
          throw error;
        }
      }

      if (selectedRiskLevels.length > 0) {
        const { error } = await supabase.from("investor_preference_risk_levels").insert(
          selectedRiskLevels.map((riskLevel: RiskLevel) => ({
            investor_id: appUser.id,
            risk_level: riskLevel,
          }))
        );

        if (error) {
          throw error;
        }
      }

      if (selectedTechnologyIds.length > 0) {
        const { error } = await supabase.from("investor_preference_technologies").insert(
          selectedTechnologyIds.map((technologyId: string) => ({
            investor_id: appUser.id,
            technology_id: technologyId,
          }))
        );

        if (error) {
          throw error;
        }
      }

      setSuccessMessage("تم حفظ التفضيلات بنجاح.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "تعذر حفظ التفضيلات حالياً.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isBootstrapping) {
    return (
      <section className="investor-preferences-page">
        <div className="investor-profile-state">جاري تحميل تفضيلات المستثمر...</div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-preferences-page">
        <div className="investor-profile-state investor-profile-state--error">
          تعذر تحميل بيانات الحساب.
        </div>
      </section>
    );
  }

  if (appUser.role !== "investor") {
    return (
      <section className="investor-preferences-page">
        <div className="investor-profile-state investor-profile-state--error">
          الصفحة غير متاحة لهذا النوع من الحسابات.
        </div>
      </section>
    );
  }

  return (
    <section className="investor-preferences-page">
      <div className="investor-preferences-page__hero">
        <div>
          <span className="investor-preferences-page__eyebrow">Preferences</span>
          <h1 className="investor-preferences-page__title">تفضيلات المستثمر</h1>
          <p className="investor-preferences-page__subtitle">
            حدد القطاعات والمراحل ومستوى المخاطرة والتقنيات ونطاق التذكرة الاستثمارية حتى تصبح
            النتائج والتوصيات أكثر دقة.
          </p>
        </div>

        <div className="investor-preferences-page__hero-actions">
          <Link to={ROUTES.investor.dashboard} className="btn btn--ghost">
            لوحة التحكم
          </Link>
          <Link to={ROUTES.investor.explore} className="btn btn--secondary">
            استكشاف المشاريع
          </Link>
        </div>
      </div>

      <div className="investor-preferences-page__summary">
        <div className="investor-preferences-page__summary-card">
          <span className="investor-preferences-page__summary-label">الاختيارات الحالية</span>
          <strong className="investor-preferences-page__summary-value">{selectedCountsLabel}</strong>
        </div>

        <div className="investor-preferences-page__summary-card">
          <span className="investor-preferences-page__summary-label">نطاق التذكرة</span>
          <strong className="investor-preferences-page__summary-value">
            {minTicketSar || "—"} إلى {maxTicketSar || "—"} ريال
          </strong>
        </div>
      </div>

      {errorMessage ? (
        <div className="investor-profile-alert investor-profile-alert--error">{errorMessage}</div>
      ) : null}

      {successMessage ? (
        <div className="investor-profile-alert investor-profile-alert--success">{successMessage}</div>
      ) : null}

      <div className="investor-preferences-page__content">
        <PreferenceCategoriesSection
          options={categoryOptions}
          selectedIds={selectedCategoryIds}
          onToggle={toggleCategory}
        />

        <PreferenceStagesSection selectedStages={selectedStages} onToggle={toggleStage} />

        <PreferenceRiskSection
          selectedRiskLevels={selectedRiskLevels}
          onToggle={toggleRiskLevel}
        />

        <PreferenceTechnologiesSection
          options={technologyOptions}
          selectedIds={selectedTechnologyIds}
          onToggle={toggleTechnology}
        />

        <TicketRangeSection
          minTicketSar={minTicketSar}
          maxTicketSar={maxTicketSar}
          onMinChange={setMinTicketSar}
          onMaxChange={setMaxTicketSar}
        />
      </div>

      <div className="investor-preferences-page__footer">
        <Link to={ROUTES.investor.profile} className="btn btn--secondary">
          الرجوع للملف الشخصي
        </Link>

        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : "حفظ التفضيلات"}
        </button>
      </div>
    </section>
  );
}