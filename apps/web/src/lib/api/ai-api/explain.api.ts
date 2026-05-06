export interface AIBaseStartupPayload {
    Stage: string;
    Category: string;
    Technologies: string;
    CustomerFocus: string;
    TeamSize: number;
    FounderMotivation: string;
    MarketSizeM: number;
    CompetitorsCount: number;
    MonthlyRevenue: number;
    FundingStage: string;
    CapitalSeeking: number;
    PostMoneyValuation: number;
    ExitStrategy: string;
  }
  
  export interface AITopReason {
    feature: string;
    feature_value: number | string | null;
    contribution_value: number | string | null;
    effect_direction: string;
    explanation: string;
  }
  
  export interface AIExplainResponse {
    risk_class: string;
    risk_score_percentage: number;
    risk_score_note?: string;
    predicted_risk_score: number;
    confidence_level: string;
    probabilities: Record<string, number>;
    recommendations: string[];
    advisory_summary: string;
    warnings: string[];
    model_version?: string;
    generated_at?: string;
    top_3_reasons?: AITopReason[];
    top_features_affecting_prediction?: AITopReason[];
  }
  
  const AI_API_BASE_URL =
    (import.meta.env.VITE_AI_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000";
    function formatApiError(responseBody: unknown): string {
        if (
          typeof responseBody === "object" &&
          responseBody !== null &&
          "detail" in responseBody
        ) {
          const detail = (responseBody as { detail?: unknown }).detail;
      
          if (Array.isArray(detail)) {
            return detail
              .map((item) => {
                if (typeof item === "object" && item !== null) {
                  const entry = item as {
                    loc?: unknown;
                    msg?: unknown;
                  };
      
                  const loc = Array.isArray(entry.loc) ? entry.loc.join(" > ") : "field";
                  const msg = typeof entry.msg === "string" ? entry.msg : "Invalid value";
      
                  return `${loc}: ${msg}`;
                }
      
                return String(item);
              })
              .join(" | ");
          }
      
          if (typeof detail === "string") {
            return detail;
          }
        }
      
        return "تعذر الحصول على شرح الذكاء الاصطناعي حالياً.";
      }
      
      export async function explainProjectAI(payload: AIBaseStartupPayload): Promise<AIExplainResponse> {
        const response = await fetch(`${AI_API_BASE_URL}/explain`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      
        const responseBody = await response.json().catch(() => null);
      
        if (!response.ok) {
          throw new Error(formatApiError(responseBody));
        }
      
        return responseBody as AIExplainResponse;
      }