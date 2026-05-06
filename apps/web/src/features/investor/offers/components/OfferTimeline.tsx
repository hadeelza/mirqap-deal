export type OfferTimelineEvent = {
    key: string;
    title: string;
    description: string;
    date: string;
    tone: "default" | "success" | "warning" | "danger";
  };
  
  type OfferTimelineProps = {
    events: OfferTimelineEvent[];
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
  
  function getToneClass(tone: OfferTimelineEvent["tone"]) {
    if (tone === "success") {
      return "offer-timeline__dot offer-timeline__dot--success";
    }
  
    if (tone === "warning") {
      return "offer-timeline__dot offer-timeline__dot--warning";
    }
  
    if (tone === "danger") {
      return "offer-timeline__dot offer-timeline__dot--danger";
    }
  
    return "offer-timeline__dot";
  }
  
  export default function OfferTimeline({ events }: OfferTimelineProps) {
    return (
      <div className="offer-timeline">
        <h2 className="offer-timeline__title">التسلسل الزمني</h2>
  
        <div className="offer-timeline__list">
          {events.map((event) => (
            <div key={event.key} className="offer-timeline__item">
              <span className={getToneClass(event.tone)} />
              <div className="offer-timeline__content">
                <div className="offer-timeline__head">
                  <h3>{event.title}</h3>
                  <time>{formatDate(event.date)}</time>
                </div>
                <p>{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }