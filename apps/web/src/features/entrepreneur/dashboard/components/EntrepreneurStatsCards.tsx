type DashboardStats = {
    totalProjects: number;
    publishedProjects: number;
    receivedOffers: number;
    openDeals: number;
  };
  
  type EntrepreneurStatsCardsProps = {
    stats: DashboardStats;
  };
  
  export default function EntrepreneurStatsCards({ stats }: EntrepreneurStatsCardsProps) {
    const items = [
      { label: "عدد المشاريع", value: stats.totalProjects },
      { label: "عدد المشاريع المنشورة", value: stats.publishedProjects },
      { label: "عدد العروض المستلمة", value: stats.receivedOffers },
      { label: "عدد الصفقات المفتوحة", value: stats.openDeals },
    ];
  
    return (
      <div className="entrepreneur-stats-grid">
        {items.map((item) => (
          <div key={item.label} className="entrepreneur-stat-card">
            <span className="entrepreneur-stat-card__label">{item.label}</span>
            <strong className="entrepreneur-stat-card__value">{item.value}</strong>
          </div>
        ))}
      </div>
    );
  }