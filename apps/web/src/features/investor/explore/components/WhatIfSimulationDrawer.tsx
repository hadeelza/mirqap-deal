import { useEffect, useState } from "react";
import type { AISimulationResponse } from "../../../../lib/api/ai-api/simulate.api";

interface WhatIfSimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTeamSize: number;
  initialMonthlyRevenue: number;
  initialFundingStage: string;
  onSubmit: (payload: {
    TeamSize?: number;
    MonthlyRevenue?: number;
    FundingStage?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  result: AISimulationResponse | null;
  errorMessage: string;
}

export default function WhatIfSimulationDrawer({
  isOpen,
  onClose,
  initialTeamSize,
  initialMonthlyRevenue,
  initialFundingStage,
  onSubmit,
  isSubmitting,
  result,
  errorMessage,
}: WhatIfSimulationDrawerProps) {
  const [teamSize, setTeamSize] = useState(String(initialTeamSize));
  const [monthlyRevenue, setMonthlyRevenue] = useState(String(initialMonthlyRevenue));
  const [fundingStage, setFundingStage] = useState(initialFundingStage);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTeamSize(String(initialTeamSize));
    setMonthlyRevenue(String(initialMonthlyRevenue));
    setFundingStage(initialFundingStage);
    setLocalError("");
  }, [isOpen, initialTeamSize, initialMonthlyRevenue, initialFundingStage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    const nextTeamSize = Number(teamSize);
    const nextMonthlyRevenue = Number(monthlyRevenue);

    const changes: {
      TeamSize?: number;
      MonthlyRevenue?: number;
      FundingStage?: string;
    } = {};

    if (!Number.isNaN(nextTeamSize) && nextTeamSize !== initialTeamSize) {
      changes.TeamSize = nextTeamSize;
    }

    if (!Number.isNaN(nextMonthlyRevenue) && nextMonthlyRevenue !== initialMonthlyRevenue) {
      changes.MonthlyRevenue = nextMonthlyRevenue;
    }

    if (fundingStage !== initialFundingStage) {
      changes.FundingStage = fundingStage;
    }

    if (Object.keys(changes).length === 0) {
      setLocalError("أدخل تغييراً واحداً على الأقل لتشغيل المحاكاة.");
      return;
    }

    await onSubmit(changes);
  }

  return (
    <div
      className={
        isOpen
          ? "project-simulation-drawer project-simulation-drawer--open"
          : "project-simulation-drawer"
      }
    >
      <div className="project-simulation-drawer__backdrop" onClick={onClose} />

      <aside className="project-simulation-drawer__panel">
        <div className="project-simulation-drawer__header">
          <div>
            <h2>What-If Simulation</h2>
            <p>جرّب تأثير تعديل بعض القيم على نتيجة المخاطر.</p>
          </div>

          <button type="button" className="btn btn--ghost" onClick={onClose}>
            إغلاق
          </button>
        </div>

        <form className="project-simulation-form" onSubmit={handleSubmit}>
          <div className="project-simulation-field">
            <label>Team Size</label>
            <input
              type="number"
              min="1"
              value={teamSize}
              onChange={(event) => setTeamSize(event.target.value)}
            />
          </div>

          <div className="project-simulation-field">
            <label>Monthly Revenue</label>
            <input
              type="number"
              min="0"
              value={monthlyRevenue}
              onChange={(event) => setMonthlyRevenue(event.target.value)}
            />
          </div>

          <div className="project-simulation-field">
            <label>Funding Stage</label>
            <select
              value={fundingStage}
              onChange={(event) => setFundingStage(event.target.value)}
            >
              <option value="Bootstrapped">Bootstrapped</option>
              <option value="Friends & Family">Friends & Family</option>
              <option value="Pre-Seed">Pre-Seed</option>
              <option value="Seed">Seed</option>
            </select>
          </div>

          {localError ? <div className="auth-error">{localError}</div> : null}
          {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

          <div className="project-simulation-actions">
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "جاري التحليل..." : "تشغيل المحاكاة"}
            </button>
          </div>
        </form>

        {result ? (
          <div className="project-simulation-result">
            <div className="project-simulation-result__summary">
              <h3>النتيجة</h3>
              <p>{result.summary}</p>
            </div>

            <div className="project-simulation-compare">
              <div className="project-simulation-side">
                <h4>قبل التعديل</h4>
                <p>التصنيف: {result.before.risk_class}</p>
                <p>الدرجة: {result.before.risk_score_percentage.toFixed(2)}%</p>
              </div>

              <div className="project-simulation-side">
                <h4>بعد التعديل</h4>
                <p>التصنيف: {result.after.risk_class}</p>
                <p>الدرجة: {result.after.risk_score_percentage.toFixed(2)}%</p>
              </div>
            </div>

            {result.advisory_summary ? (
              <div className="project-simulation-result__summary">
                <h3>الملخص الاستشاري</h3>
                <p>{result.advisory_summary}</p>
              </div>
            ) : null}

            {result.key_decision_points?.length ? (
              <div className="project-simulation-result__list">
                <h3>نقاط القرار</h3>
                <ul>
                  {result.key_decision_points.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.client_actions?.length ? (
              <div className="project-simulation-result__list">
                <h3>إجراءات مقترحة</h3>
                <ul>
                  {result.client_actions.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.disclaimer ? (
              <div className="project-disclaimer-box">
                <h3>تنبيه</h3>
                <p>{result.disclaimer}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}