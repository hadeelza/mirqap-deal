import { Link } from "react-router-dom";

type OfferResponseActionsProps = {
  offerId: string;
  projectId: string;
  status: string;
  dealId: string | null;
  isSubmitting: boolean;
  successMessage: string;
  errorMessage: string;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  onNegotiate: () => Promise<void>;
};

function canRespond(status: string) {
  return status === "pending" || status === "negotiating";
}

export default function OfferResponseActions({
  offerId,
  projectId,
  status,
  dealId,
  isSubmitting,
  successMessage,
  errorMessage,
  onAccept,
  onReject,
  onNegotiate,
}: OfferResponseActionsProps) {
  return (
    <section className="entrepreneur-review-actions">
      <div className="entrepreneur-review-actions__header">
        <div>
          <h2>اتخاذ القرار</h2>
          <p>يمكنك قبول العرض أو رفضه أو تحويله إلى تفاوض.</p>
        </div>
      </div>

      {successMessage ? <div className="entrepreneur-page__success">{successMessage}</div> : null}
      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <div className="entrepreneur-review-actions__buttons">
        <button
          type="button"
          className="btn btn--primary"
          disabled={isSubmitting || !canRespond(status)}
          onClick={() => void onAccept()}
        >
          {isSubmitting ? "جارٍ التنفيذ..." : "قبول العرض"}
        </button>

        <button
          type="button"
          className="btn btn--ghost"
          disabled={isSubmitting || !canRespond(status)}
          onClick={() => void onNegotiate()}
        >
          {isSubmitting ? "جارٍ التنفيذ..." : "تحويل إلى تفاوض"}
        </button>

        <button
          type="button"
          className="btn btn--danger"
          disabled={isSubmitting || !canRespond(status)}
          onClick={() => void onReject()}
        >
          {isSubmitting ? "جارٍ التنفيذ..." : "رفض العرض"}
        </button>
      </div>

      <div className="entrepreneur-review-actions__links">
        <Link to="/entrepreneur/offers" className="btn btn--ghost btn--sm">
          العودة للعروض المستلمة
        </Link>

        <Link to={`/entrepreneur/projects/${projectId}`} className="btn btn--ghost btn--sm">
          فتح المشروع
        </Link>

        <Link to={`/entrepreneur/chats?offerId=${offerId}`} className="btn btn--ghost btn--sm">
          فتح المحادثة
        </Link>

        {dealId ? (
          <Link to={`/entrepreneur/deals/${dealId}/edit`} className="btn btn--primary btn--sm">
            إدارة الصفقة
          </Link>
        ) : null}

        <span className="entrepreneur-review-actions__ref">رقم العرض: {offerId}</span>
      </div>
    </section>
  );
}