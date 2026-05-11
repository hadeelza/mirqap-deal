import { Link } from "react-router-dom";

export type EntrepreneurChatListItem = {
  id: string;
  projectId: string;
  projectTitle: string;
  investorName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type EntrepreneurChatsListProps = {
  chats: EntrepreneurChatListItem[];
};

function formatDate(value: string) {
  if (!value) {
    return "بدون تاريخ";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function EntrepreneurChatsList({ chats }: EntrepreneurChatsListProps) {
  if (!chats.length) {
    return (
      <div className="entrepreneur-empty-state">
        <h3>لا توجد محادثات</h3>
        <p>لم يتم إنشاء أي محادثة حتى الآن.</p>
      </div>
    );
  }

  return (
    <div className="entrepreneur-chats-list">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          to={`/entrepreneur/chats/${chat.id}`}
          className="entrepreneur-chat-list-card"
        >
          <div className="entrepreneur-chat-list-card__top">
            <div>
              <h3>{chat.investorName}</h3>
              <p>{chat.projectTitle}</p>
            </div>

            {chat.unreadCount > 0 ? (
              <span className="entrepreneur-chat-list-card__badge">{chat.unreadCount}</span>
            ) : null}
          </div>

          <div className="entrepreneur-chat-list-card__body">
            <p>{chat.lastMessage || "لا توجد رسالة بعد."}</p>
          </div>

          <div className="entrepreneur-chat-list-card__footer">
            <span>آخر رسالة</span>
            <strong>{formatDate(chat.lastMessageAt)}</strong>
          </div>
        </Link>
      ))}
    </div>
  );
}