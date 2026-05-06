import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import type { InvestorChatListItem } from "../pages/InvestorChatsPage";

type InvestorChatsListProps = {
  items: InvestorChatListItem[];
  isLoading: boolean;
  errorMessage: string;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InvestorChatsList({
  items,
  isLoading,
  errorMessage,
}: InvestorChatsListProps) {
  if (isLoading) {
    return (
      <div className="investor-chat-list">
        <div className="investor-chat-card investor-chat-card--loading">جاري تحميل المحادثات...</div>
        <div className="investor-chat-card investor-chat-card--loading">جاري تحميل المحادثات...</div>
        <div className="investor-chat-card investor-chat-card--loading">جاري تحميل المحادثات...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="investor-empty-card">
        <h2>تعذر تحميل المحادثات</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="investor-empty-card">
        <h2>لا توجد محادثات حالياً</h2>
        <p>عند بدء التواصل مع رائد أعمال ستظهر المحادثة هنا مباشرة.</p>
        <Link to={ROUTES.investor.explore} className="btn btn--primary">
          استكشاف المشاريع
        </Link>
      </div>
    );
  }

  return (
    <div className="investor-chat-list">
      {items.map((item: InvestorChatListItem) => (
        <Link
          key={item.id}
          to={ROUTES.investor.chatDetails(item.id)}
          className="investor-chat-card"
        >
          <div className="investor-chat-card__head">
            <div>
              <h3 className="investor-chat-card__title">{item.projectTitle}</h3>
              <p className="investor-chat-card__meta">
                {item.companyName} • {item.entrepreneurName}
              </p>
            </div>

            <div className="investor-chat-card__side">
              {item.unreadCount > 0 ? (
                <span className="investor-chat-card__badge">{item.unreadCount}</span>
              ) : null}
              <span className="investor-chat-card__date">{formatDateTime(item.lastMessageAt)}</span>
            </div>
          </div>

          <p className="investor-chat-card__preview">{item.lastMessagePreview}</p>

          <div className="investor-chat-card__footer">
            <span>فتح المحادثة</span>
            <span>←</span>
          </div>
        </Link>
      ))}
    </div>
  );
}