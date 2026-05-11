type EntrepreneurChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  isMine: boolean;
};

type EntrepreneurChatWindowProps = {
  messages: EntrepreneurChatMessage[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function EntrepreneurChatWindow({
  messages,
}: EntrepreneurChatWindowProps) {
  if (!messages.length) {
    return (
      <div className="entrepreneur-chat-window entrepreneur-chat-window--empty">
        <p>ابدأ المحادثة الآن.</p>
      </div>
    );
  }

  return (
    <div className="entrepreneur-chat-window">
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.isMine
              ? "entrepreneur-chat-bubble entrepreneur-chat-bubble--mine"
              : "entrepreneur-chat-bubble entrepreneur-chat-bubble--other"
          }
        >
          <div className="entrepreneur-chat-bubble__sender">{message.senderName}</div>
          <p>{message.body}</p>
          <div className="entrepreneur-chat-bubble__meta">
            <span>{formatDate(message.createdAt)}</span>
            {message.isMine ? <span>{message.readAt ? "مقروءة" : "مرسلة"}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}