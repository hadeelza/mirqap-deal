type InvestorStatsCardsProps = {
    isLoading?: boolean;
    stats: {
      suitableProjects: number;
      interestedProjects: number;
      offersCount: number;
      openDeals: number;
    };
  };
  
  function formatNumber(value: number) {
    return new Intl.NumberFormat("ar-SA").format(value);
  }
  
  export default function InvestorStatsCards({
    isLoading = false,
    stats,
  }: InvestorStatsCardsProps) {
    const items = [
      {
        title: "المشاريع المناسبة",
        value: stats.suitableProjects,
        icon: "◎",
        helper: "مبنية على التفضيلات والمطابقة الأولية",
      },
      {
        title: "المشاريع المهتم بها",
        value: stats.interestedProjects,
        icon: "★",
        helper: "المشاريع التي قمت بحفظها للاهتمام",
      },
      {
        title: "العروض المقدمة",
        value: stats.offersCount,
        icon: "◌",
        helper: "إجمالي العروض الاستثمارية التي أرسلتها",
      },
      {
        title: "الصفقات المفتوحة",
        value: stats.openDeals,
        icon: "◈",
        helper: "الصفقات التي لا تزال قيد المتابعة",
      },
    ];
  
    return (
      <div className="investor-stats-cards">
        {items.map((item) => (
          <article key={item.title} className="investor-stats-cards__item">
            <div className="investor-stats-cards__top">
              <span className="investor-stats-cards__icon">{item.icon}</span>
              <span className="investor-stats-cards__title">{item.title}</span>
            </div>
  
            {isLoading ? (
              <div className="investor-stats-cards__value investor-stats-cards__value--loading" />
            ) : (
              <strong className="investor-stats-cards__value">{formatNumber(item.value)}</strong>
            )}
  
            <p className="investor-stats-cards__helper">{item.helper}</p>
          </article>
        ))}
      </div>
    );
  }