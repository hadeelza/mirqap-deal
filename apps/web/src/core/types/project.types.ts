export type StartupStage = "idea" | "mvp_seed";

export type CustomerFocus =
  | "b2b"
  | "b2c"
  | "b2g"
  | "marketplace"
  | "other";

export interface PublicProjectCardData {
  id: string;
  title: string;
  companyName: string;
  shortPitch: string;
  categoryNameAr: string;
  startupStage: StartupStage;
  customerFocus: CustomerFocus;
  capitalSeekingSar: number;
  monthlyRevenueSar: number;
  publishedAt: string | null;
}

export interface PublicMainPageData {
  publishedProjectsCount: number;
  categoriesCount: number;
  technologiesCount: number;
  averageCapitalSeekingSar: number;
  averageMonthlyRevenueSar: number;
  featuredProject: PublicProjectCardData | null;
  latestProjects: PublicProjectCardData[];
}