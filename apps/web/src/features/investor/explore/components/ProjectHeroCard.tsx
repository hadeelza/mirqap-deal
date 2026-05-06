import type { ReactNode } from "react";

interface ProjectHeroCardProps {
  title: string;
  companyName: string;
  shortPitch: string;
  categoryName: string;
  startupStage: string;
  confidenceLevel: string;
  investmentStatus: string;
  capitalSeekingSar: number | null;
  actions: ReactNode;
}

export default function ProjectHeroCard({
  title,
  companyName,
  shortPitch,
  categoryName,
  startupStage,
  confidenceLevel,
  investmentStatus,
  capitalSeekingSar,
  actions,
}: ProjectHeroCardProps) {
  return (
    <section className="project-details-hero">
      <div className="project-details-hero__content">
        <div className="project-details-hero__chips">
          <span className="project-details-chip">{categoryName}</span>
          <span className="project-details-chip">{startupStage}</span>
          <span className="project-details-chip">{confidenceLevel}</span>
          <span className="project-details-chip">{investmentStatus}</span>
        </div>

        <h1 className="project-details-hero__title">{title}</h1>

        {companyName ? (
          <p className="project-details-hero__company">{companyName}</p>
        ) : null}

        <p className="project-details-hero__pitch">
          {shortPitch || "لا يوجد ملخص مختصر لهذا المشروع."}
        </p>

        <div className="project-details-hero__amount">
          <span>رأس المال المطلوب</span>
          <strong>
            {capitalSeekingSar !== null
              ? `${new Intl.NumberFormat("ar-SA").format(capitalSeekingSar)} ريال`
              : "غير محدد"}
          </strong>
        </div>
      </div>

      <div className="project-details-hero__actions">{actions}</div>
    </section>
  );
}