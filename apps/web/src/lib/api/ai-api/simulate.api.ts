import type { AIBaseStartupPayload, AITopReason } from "./explain.api";

export interface AISimulationRequest {
  base_startup: AIBaseStartupPayload;
  changed_fields: Partial<{
    TeamSize: number;
    MonthlyRevenue: number;
    FundingStage: string;
  }>;
  top_n?: number;
}

export interface AISimulationSide {
  risk_class: string;
  risk_score_percentage: number;
  top_reasons: AITopReason[];
}

export interface AISimulationResponse {
  summary: string;
  before: AISimulationSide;
  after: AISimulationSide;
  recommendations: string[];
  advisory_summary: string;
  deep_explanation?: string;
  detailed_explanation?: string;
  key_decision_points?: string[];
  client_actions?: string[];
  disclaimer?: string;
  warnings?: string[];
  updated_input?: Record<string, unknown>;
  changed_fields?: Record<string, unknown>;
  provider?: string;
  model_id?: string;
  model_version?: string;
  generated_at?: string;
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
  
    return "تعذر تنفيذ المحاكاة حالياً.";
  }
  
  export async function simulateProjectWhatIf(
    payload: AISimulationRequest
  ): Promise<AISimulationResponse> {
    const response = await fetch(`${AI_API_BASE_URL}/what-if`, {
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
  
    return responseBody as AISimulationResponse;
  }