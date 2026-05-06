type ProjectStatusCardProps = {
    approvalStatus: string;
    publicationStatus: string;
    investmentStatus: string;
    offersCount: number;
  };
  
  function getApprovalLabel(value: string) {
    switch (value) {
      case "draft":
        return "مسودة";
      case "submitted":
        return "تم الإرسال";
      case "under_review":
        return "قيد المراجعة";
      case "approved":
        return "معتمد";
      case "rejected":
        return "مرفوض";
      case "changes_requested":
        return "مطلوب تعديل";
      default:
        return value;
    }
  }
  
  function getPublicationLabel(value: string) {
    switch (value) {
      case "private":
        return "خاص";
      case "published":
        return "منشور";
      case "hidden":
        return "مخفي";
      case "archived":
        return "مؤرشف";
      default:
        return value;
    }
  }
  
  function getInvestmentLabel(value: string) {
    switch (value) {
      case "open":
        return "مفتوح";
      case "in_negotiation":
        return "تحت التفاوض";
      case "funded":
        return "تم التمويل";
      case "closed":
        return "مغلق";
      default:
        return value;
    }
  }
  
  export default function ProjectStatusCard({
    approvalStatus,
    publicationStatus,
    investmentStatus,
    offersCount,
  }: ProjectStatusCardProps) {
    return (
      <div className="entrepreneur-status-card">
        <span className="status-chip status-chip--slate">{getApprovalLabel(approvalStatus)}</span>
        <span className="status-chip status-chip--blue">{getPublicationLabel(publicationStatus)}</span>
        <span className="status-chip status-chip--gold">{getInvestmentLabel(investmentStatus)}</span>
        <span className="status-chip status-chip--soft">العروض: {offersCount}</span>
      </div>
    );
  }