type QuestionKey =
  | "explain_result"
  | "why_risk"
  | "score_meaning"
  | "top_reasons"
  | "improve_profile";

type AIExplanationPanelProps = {
  activeQuestion: QuestionKey | null;
  answer: string;
  isLoading: boolean;
  errorMessage: string;
  onAsk: (question: QuestionKey) => Promise<void>;
};

const questions: { key: QuestionKey; label: string }[] = [
  { key: "explain_result", label: "اشرح لي النتيجة" },
  { key: "why_risk", label: "لماذا المخاطر مرتفعة أو متوسطة؟" },
  { key: "score_meaning", label: "ما معنى السكور؟" },
  { key: "top_reasons", label: "ما أكثر الأسباب تأثيرًا؟" },
  { key: "improve_profile", label: "كيف أُحسن الملف قبل عرضه؟" },
];

export default function AIExplanationPanel({
  activeQuestion,
  answer,
  isLoading,
  errorMessage,
  onAsk,
}: AIExplanationPanelProps) {
  return (
    <section className="entrepreneur-ai-card">
      <div className="entrepreneur-ai-card__header">
        <h2>لوحة الشرح الذكي</h2>
      </div>

      <div className="entrepreneur-ai-questions">
        {questions.map((question) => (
          <button
            key={question.key}
            type="button"
            className={
              activeQuestion === question.key
                ? "entrepreneur-ai-question-btn entrepreneur-ai-question-btn--active"
                : "entrepreneur-ai-question-btn"
            }
            onClick={() => void onAsk(question.key)}
            disabled={isLoading}
          >
            {question.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="entrepreneur-empty-mini">جارٍ توليد الشرح الذكي...</div>
      ) : null}

      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      {!isLoading && !errorMessage ? (
        <div className="entrepreneur-ai-answer-box">
          {answer ? <p>{answer}</p> : <p>اختر سؤالًا جاهزًا لعرض شرح أعمق للمشروع.</p>}
        </div>
      ) : null}
    </section>
  );
}