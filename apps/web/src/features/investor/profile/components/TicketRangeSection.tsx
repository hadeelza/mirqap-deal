interface TicketRangeSectionProps {
    minTicketSar: string;
    maxTicketSar: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
  }
  
  export default function TicketRangeSection({
    minTicketSar,
    maxTicketSar,
    onMinChange,
    onMaxChange,
  }: TicketRangeSectionProps) {
    return (
      <section className="investor-preference-section">
        <div className="investor-preference-section__header">
          <h2 className="investor-preference-section__title">نطاق التذكرة الاستثمارية</h2>
          <p className="investor-preference-section__subtitle">
            أدخل الحد الأدنى والحد الأعلى للمبلغ الاستثماري المفضل بالريال السعودي.
          </p>
        </div>
  
        <div className="investor-ticket-grid">
          <div className="investor-ticket-field">
            <label htmlFor="investor-min-ticket">الحد الأدنى</label>
            <input
              id="investor-min-ticket"
              type="number"
              min="0"
              step="1"
              value={minTicketSar}
              onChange={(event) => onMinChange(event.target.value)}
              placeholder="مثال: 50000"
            />
          </div>
  
          <div className="investor-ticket-field">
            <label htmlFor="investor-max-ticket">الحد الأعلى</label>
            <input
              id="investor-max-ticket"
              type="number"
              min="0"
              step="1"
              value={maxTicketSar}
              onChange={(event) => onMaxChange(event.target.value)}
              placeholder="مثال: 500000"
            />
          </div>
        </div>
      </section>
    );
  }