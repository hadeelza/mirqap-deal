import { useEffect, useRef } from "react";

export type InvestorChatMessage = {
  id: string;
  body: string;
  attachmentUrl: string | null;
  senderId: string;
  senderName: string;
  readAt: string | null;
  createdAt: string;
};

type InvestorChatWindowProps = {
  messages: InvestorChatMessage[];
  currentUserId: string;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InvestorChatWindow({
  messages,
  currentUserId,
}: InvestorChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="investor-chat-window investor-chat-window--empty">
        <h3>لا توجد رسائل بعد</h3>
        <p>ابدأ المحادثة الآن وستظهر الرسائل هنا مباشرة.</p>
      </div>
    );
  }

  return (
    <div className="investor-chat-window">
      {messages.map((message: InvestorChatMessage) => {
        const isMine = message.senderId === currentUserId;

        return (
          <div
            key={message.id}
            className={
              isMine
                ? "investor-chat-message investor-chat-message--mine"
                : "investor-chat-message"
            }
          >
            <div className="investor-chat-message__bubble">
              <div className="investor-chat-message__sender">{isMine ? "أنت" : message.senderName}</div>
              <p className="investor-chat-message__body">{message.body}</p>

              {message.attachmentUrl ? (
                <a
                  href={message.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="investor-chat-message__attachment"
                >
                  فتح المرفق
                </a>
              ) : null}

              <div className="investor-chat-message__meta">
                <span>{formatDateTime(message.createdAt)}</span>
                {isMine ? (
                  <span>{message.readAt ? "تمت القراءة" : "مرسلة"}</span>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}