import { supabase } from "../client";
import type {
  PublicFeaturedProject,
  PublicTrendPoint,
} from "../../../core/types/public.types";

type RawFeaturedProjectRow = {
  id: string;
  title: string;
  company_name: string | null;
  short_pitch: string | null;
  startup_stage: string | null;
  customer_focus: string | null;
  capital_seeking_sar: number | null;
  monthly_revenue_sar: number | null;
  market_size_m: number | null;
  team_size: number | null;
  project_categories:
    | {
        name_ar: string | null;
        name_en: string | null;
      }
    | {
        name_ar: string | null;
        name_en: string | null;
      }[]
    | null;
  project_ai_evaluations:
    | {
        risk_level: "low" | "medium" | "high" | null;
        risk_score: number | null;
        created_at?: string | null;
      }[]
    | null;
};

const GREGORIAN_MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

function normalizeCategoryName(
  category:
    | {
        name_ar: string | null;
        name_en: string | null;
      }
    | {
        name_ar: string | null;
        name_en: string | null;
      }[]
    | null
): string {
  if (!category) {
    return "غير مصنف";
  }

  const categoryObject = Array.isArray(category) ? category[0] : category;

  return categoryObject?.name_ar || categoryObject?.name_en || "غير مصنف";
}

export async function getPublishedProjectsCount(): Promise<number> {
  const response = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("approval_status", "approved")
    .eq("publication_status", "published");

  if (response.error) {
    throw response.error;
  }

  return response.count ?? 0;
}

export async function getFeaturedPublicProject(): Promise<PublicFeaturedProject | null> {
  const response = await supabase
    .from("projects")
    .select(
      `
      id,
      title,
      company_name,
      short_pitch,
      startup_stage,
      customer_focus,
      capital_seeking_sar,
      monthly_revenue_sar,
      market_size_m,
      team_size,
      project_categories (
        name_ar,
        name_en
      ),
      project_ai_evaluations (
        risk_level,
        risk_score,
        created_at
      )
    `
    )
    .eq("approval_status", "approved")
    .eq("publication_status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw response.error;
  }

  const row = response.data as RawFeaturedProjectRow | null;

  if (!row) {
    return null;
  }

  const evaluations = Array.isArray(row.project_ai_evaluations)
    ? [...row.project_ai_evaluations].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })
    : [];

  const latestEvaluation = evaluations[0];

  return {
    id: row.id,
    title: row.title,
    companyName: row.company_name || row.title,
    shortPitch: row.short_pitch || "مشروع استثماري منشور على المنصة.",
    categoryNameAr: normalizeCategoryName(row.project_categories),
    startupStage: row.startup_stage || "idea",
    customerFocus: row.customer_focus || "other",
    capitalSeekingSar: Number(row.capital_seeking_sar ?? 0),
    monthlyRevenueSar: Number(row.monthly_revenue_sar ?? 0),
    marketSizeM: Number(row.market_size_m ?? 0),
    teamSize: Number(row.team_size ?? 0),
    riskLevel: latestEvaluation?.risk_level ?? null,
    riskScore: latestEvaluation?.risk_score ?? null,
  };
}

export async function getPublishedProjectsTrend(
  monthsCount = 8
): Promise<PublicTrendPoint[]> {
  const now = new Date();
  const firstMonthDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);

  const response = await supabase
    .from("projects")
    .select("id, published_at")
    .eq("approval_status", "approved")
    .eq("publication_status", "published")
    .gte("published_at", firstMonthDate.toISOString());

  if (response.error) {
    throw response.error;
  }

  const buckets: PublicTrendPoint[] = [];

  for (let i = 0; i < monthsCount; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1 - i), 1);
    buckets.push({
      label: GREGORIAN_MONTHS_AR[date.getMonth()],
      value: 0,
    });
  }

  for (const item of response.data ?? []) {
    if (!item.published_at) {
      continue;
    }

    const itemDate = new Date(item.published_at);
    const itemKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;
    const bucketIndex = buckets.findIndex((_, index) => {
      const bucketDate = new Date(
        now.getFullYear(),
        now.getMonth() - (monthsCount - 1 - index),
        1
      );
      const bucketKey = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`;
      return bucketKey === itemKey;
    });

    if (bucketIndex >= 0) {
      buckets[bucketIndex].value += 1;
    }
  }

  return buckets;
}