export type DealTimelineItem = {
    key: string;
    title: string;
    description: string;
    date: string;
    tone: "default" | "success" | "warning" | "danger";
  };
  
  type DealTimelineProps = {
    items: DealTimelineItem[];
  };
  
  function formatDate(value: string) {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }
  
  function getToneClass(tone: DealTimelineItem["tone"]) {
    if (tone === "success") {
      return "deal-timeline__dot deal-timeline__dot--success";
    }
  
    if (tone === "warning") {
      return "deal-timeline__dot deal-timeline__dot--warning";
    }
  
    if (tone === "danger") {
      return "deal-timeline__dot deal-timeline__dot--danger";
    }
  
    return "deal-timeline__dot";
  }
  
  export default function DealTimeline({ items }: DealTimelineProps) {
    return (
      <div className="deal-timeline">
        <h2 className="deal-timeline__title">التسلسل الزمني للصفقة</h2>
  
        <div className="deal-timeline__list">
          {items.map((item) => (
            <div key={item.key} className="deal-timeline__item">
              <span className={getToneClass(item.tone)} />
              <div className="deal-timeline__content">
                <div className="deal-timeline__head">
                  <h3>{item.title}</h3>
                  <time>{formatDate(item.date)}</time>
                </div>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }