import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import EntrepreneurChatWindow from "../components/EntrepreneurChatWindow";
import EntrepreneurMessageComposer from "../components/EntrepreneurMessageComposer";

type ChatRow = {
  id: string;
  project_id: string | null;
  offer_id: string | null;
  deal_id: string | null;
  investor_id: string;
};

type ProjectRow = {
  id: string;
  title: string;
};

type UserRow = {
  id: string;
  full_name: string | null;
};

type MessageRow = {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string | null;
  attachment_url: string | null;
  read_at: string | null;
  created_at: string;
};

type EntrepreneurChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  isMine: boolean;
};

type ChatMeta = {
  chatId: string;
  projectId: string | null;
  offerId: string | null;
  dealId: string | null;
  projectTitle: string;
  investorId: string;
  investorName: string;
};

export default function EntrepreneurChatDetailsPage() {
  const { appUser, isLoading } = useAuthUser();
  const { chatId } = useParams();

  const [chatMeta, setChatMeta] = useState<ChatMeta | null>(null);
  const [messages, setMessages] = useState<EntrepreneurChatMessage[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadChat() {
      if (!appUser || appUser.role !== "entrepreneur" || !chatId) {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const { data: chatRow, error: chatError } = await supabase
          .from("chats")
          .select("id,project_id,offer_id,deal_id,investor_id")
          .eq("id", chatId)
          .eq("entrepreneur_id", appUser.id)
          .maybeSingle();

        if (chatError) {
          throw chatError;
        }

        if (!chatRow) {
          setChatMeta(null);
          return;
        }

        const safeChat = chatRow as ChatRow;

        const [{ data: projectRow }, { data: investorRow }, { data: messageRows }] =
          await Promise.all([
            safeChat.project_id
              ? supabase.from("projects").select("id,title").eq("id", safeChat.project_id).maybeSingle()
              : Promise.resolve({ data: null }),
            supabase.from("users").select("id,full_name").eq("id", safeChat.investor_id).maybeSingle(),
            supabase
              .from("chat_messages")
              .select("id,chat_id,sender_id,body,attachment_url,read_at,created_at")
              .eq("chat_id", safeChat.id)
              .order("created_at", { ascending: true }),
          ]);

        const safeProject = (projectRow ?? null) as ProjectRow | null;
        const safeInvestor = (investorRow ?? null) as UserRow | null;
        const safeMessages = (messageRows ?? []) as MessageRow[];

        setChatMeta({
          chatId: safeChat.id,
          projectId: safeChat.project_id,
          offerId: safeChat.offer_id,
          dealId: safeChat.deal_id,
          projectTitle: safeProject?.title || "مشروع",
          investorId: safeChat.investor_id,
          investorName: safeInvestor?.full_name?.trim() || "مستثمر",
        });

        setMessages(
          safeMessages.map((message: MessageRow) => ({
            id: message.id,
            senderId: message.sender_id,
            senderName:
              message.sender_id === appUser.id
                ? "أنت"
                : safeInvestor?.full_name?.trim() || "المستثمر",
            body: message.body?.trim() || "",
            readAt: message.read_at,
            createdAt: message.created_at,
            isMine: message.sender_id === appUser.id,
          }))
        );

        const unreadIncomingIds = safeMessages
          .filter((message: MessageRow) => message.sender_id !== appUser.id && !message.read_at)
          .map((message: MessageRow) => message.id);

        if (unreadIncomingIds.length) {
          await supabase
            .from("chat_messages")
            .update({ read_at: new Date().toISOString() })
            .in("id", unreadIncomingIds);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل المحادثة.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadChat();
  }, [appUser, chatId]);

  useEffect(() => {
    if (!appUser || !chatMeta) {
      return;
    }

    const channel = supabase
      .channel(`entrepreneur-chat-${chatMeta.chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatMeta.chatId}`,
        },
        async (payload) => {
          const row = payload.new as MessageRow;

          setMessages((current) => {
            if (current.some((item) => item.id === row.id)) {
              return current;
            }

            return [
              ...current,
              {
                id: row.id,
                senderId: row.sender_id,
                senderName:
                  row.sender_id === appUser.id ? "أنت" : chatMeta.investorName,
                body: row.body?.trim() || "",
                readAt: row.read_at,
                createdAt: row.created_at,
                isMine: row.sender_id === appUser.id,
              },
            ];
          });

          if (row.sender_id !== appUser.id && !row.read_at) {
            const now = new Date().toISOString();

            await supabase
              .from("chat_messages")
              .update({ read_at: now })
              .eq("id", row.id);

            setMessages((current) =>
              current.map((item) =>
                item.id === row.id
                  ? {
                      ...item,
                      readAt: now,
                    }
                  : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [appUser, chatMeta]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(body: string) {
    if (!appUser || !chatMeta) {
      return;
    }

    try {
      setErrorMessage("");
      setIsSubmitting(true);

      const now = new Date().toISOString();

      const { data: insertedMessage, error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: chatMeta.chatId,
          sender_id: appUser.id,
          body,
          attachment_url: null,
          created_at: now,
        })
        .select("id,chat_id,sender_id,body,attachment_url,read_at,created_at")
        .single();

      if (messageError) {
        throw messageError;
      }

      const safeInserted = insertedMessage as MessageRow;

      setMessages((current) => {
        if (current.some((item) => item.id === safeInserted.id)) {
          return current;
        }

        return [
          ...current,
          {
            id: safeInserted.id,
            senderId: safeInserted.sender_id,
            senderName: "أنت",
            body: safeInserted.body?.trim() || "",
            readAt: safeInserted.read_at,
            createdAt: safeInserted.created_at,
            isMine: true,
          },
        ];
      });

      const { error: notificationError } = await supabase.from("notifications").insert({
        recipient_id: chatMeta.investorId,
        type: "message_received",
        title: "رسالة جديدة",
        body: `لديك رسالة جديدة بخصوص مشروع ${chatMeta.projectTitle}.`,
        ref_type: "chat",
        ref_id: chatMeta.chatId,
        is_read: false,
        created_at: now,
      });

      if (notificationError) {
        throw notificationError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر إرسال الرسالة.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const orderedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [messages]);

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل المحادثة...</div>
      </section>
    );
  }

  if (!appUser || appUser.role !== "entrepreneur") {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">تعذر التحقق من حساب رائد الأعمال.</div>
      </section>
    );
  }

  if (!chatMeta) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">المحادثة غير موجودة.</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-page entrepreneur-chat-details-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">تفاصيل المحادثة</h1>
          <p className="entrepreneur-page__subtitle">
            {chatMeta.investorName} — {chatMeta.projectTitle}
          </p>
        </div>

        <div className="entrepreneur-page__header-actions">
          <Link to="/entrepreneur/chats" className="btn btn--ghost">
            العودة للمحادثات
          </Link>

          {chatMeta.offerId ? (
            <Link to={`/entrepreneur/offers/${chatMeta.offerId}`} className="btn btn--ghost">
              فتح العرض
            </Link>
          ) : null}

          {chatMeta.dealId ? (
            <Link to={`/entrepreneur/deals/${chatMeta.dealId}/edit`} className="btn btn--ghost">
              إدارة الصفقة
            </Link>
          ) : null}
        </div>
      </div>

      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <div className="entrepreneur-chat-layout">
        <EntrepreneurChatWindow messages={orderedMessages} />
        <div ref={bottomRef} />
        <EntrepreneurMessageComposer
          isSubmitting={isSubmitting}
          onSend={handleSendMessage}
        />
      </div>
    </section>
  );
}