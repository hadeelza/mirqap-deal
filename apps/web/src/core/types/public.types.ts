export type PublicRiskLevel = "low" | "medium" | "high" | null;

export interface PublicFeaturedProject {
  id: string;
  title: string;
  companyName: string;
  shortPitch: string;
  categoryNameAr: string;
  startupStage: string;
  customerFocus: string;
  capitalSeekingSar: number;
  monthlyRevenueSar: number;
  marketSizeM: number;
  teamSize: number;
  riskLevel: PublicRiskLevel;
  riskScore: number | null;
}

export interface PublicTrendPoint {
  label: string;
  value: number;
}

export interface PublicCounts {
  publishedProjectsCount: number;
  investorsCount: number;
  entrepreneursCount: number;
}