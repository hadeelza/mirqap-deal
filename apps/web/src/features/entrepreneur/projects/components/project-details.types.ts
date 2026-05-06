export type ProjectTechnologyItem = {
    id: string;
    label: string;
  };
  
  export type ProjectFileItem = {
    id: string;
    fileName: string;
    fileType: string;
    mimeType: string | null;
    fileSize: number | null;
    publicUrl: string | null;
    storagePath: string | null;
    bucketName: string | null;
    createdAt: string;
  };
  
  export type ProjectProbabilityItem = {
    label: string;
    value: number;
  };
  
  export type ProjectReasonItem = {
    feature: string;
    explanation: string;
    effectDirection: string | null;
    contributionValue: number | null;
  };
  
  export type ProjectEvaluationView = {
    riskLevel: string | null;
    riskScore: number | null;
    confidenceLevel: string | null;
    aiSummary: string | null;
    recommendations: string[];
    warnings: string[];
    probabilities: ProjectProbabilityItem[];
    topReasons: ProjectReasonItem[];
  };
  
  export type ProjectOfferPreview = {
    id: string;
    investorName: string;
    offerAmountSar: number | null;
    equityPercentage: number | null;
    status: string;
    createdAt: string;
  };
  
  export type EntrepreneurProjectDetailsData = {
    id: string;
    title: string;
    companyName: string | null;
    shortPitch: string | null;
    categoryName: string;
    startupStage: string | null;
    confidenceLevel: string | null;
    customerFocus: string | null;
    teamSize: number | null;
    founderMotivation: string | null;
    marketSizeM: number | null;
    competitorsCount: number | null;
    monthlyRevenueSar: number | null;
    capitalSeekingSar: number | null;
    postMoneyValuationSar: number | null;
    fundingStage: string | null;
    problemDescription: string | null;
    solutionDescription: string | null;
    differentiation: string | null;
    traction: string | null;
    risks: string | null;
    exitStrategy: string | null;
    approvalStatus: string;
    publicationStatus: string;
    investmentStatus: string;
    submittedAt: string | null;
    publishedAt: string | null;
    createdAt: string;
    technologies: ProjectTechnologyItem[];
    files: ProjectFileItem[];
    evaluation: ProjectEvaluationView | null;
    offers: ProjectOfferPreview[];
  };