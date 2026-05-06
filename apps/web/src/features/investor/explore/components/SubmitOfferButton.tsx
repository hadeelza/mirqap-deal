import { Link } from "react-router-dom";

type SubmitOfferButtonProps = {
  projectId: string;
};

export default function SubmitOfferButton({ projectId }: SubmitOfferButtonProps) {
  return (
    <Link to={`/investor/offers/submit/${projectId}`} className="btn btn--primary">
      تقديم عرض استثماري
    </Link>
  );
}