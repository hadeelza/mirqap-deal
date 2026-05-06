import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import InvestorChatWindow, { type InvestorChatMessage } from "../components/InvestorChatWindow";
import InvestorMessageComposer from "../components/InvestorMessageComposer";

type MaybeArray<T> = T | T[] | null;

type ChatProjectRow = {
  id: string;
  title: string | null;
  company_name: string | null;
  investment_status: string | null;
};

type ChatUserRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ChatOfferRow = {
  id: string;
  status: string | null;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
};

type ChatDealRow = {
  id: string;
  status: string | null;
  contact_shared_at: string | null;
};

type ChatMetaRow = {
  id: string;
  entrepreneur_id: string;
  project: MaybeArray<ChatProjectRow>;
  entrepreneur: MaybeArray<ChatUserRow>;
  offer: MaybeArray<ChatOfferRow>;
  deal: MaybeArray<ChatDealRow>;
};

type ChatMessageRow = {
  id: string;
  body: string | null;
  attachment_url: string | null;
  sender_id: string;
  read_at: string | null;
  created_at: string;
  sender: MaybeArray<ChatUserRow>;
};

type ChatMeta = {
  id: string;
  entrepreneurId: string;
  entrepreneurName: string;
  projectId: string;
  projectTitle: string;
  companyName: string;
  offerId: string | null;
  dealId: string | null;
};

function normalizeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function InvestorChatDetailsPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [chatMeta, setChatMeta] = useState<ChatMeta | null>(null);
  const [messages, setMessages] = useState<InvestorChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadChatMeta = useCallback(async () => {
    if (!appUser?.id || !chatId) {
      return;
    }

    const { data, error } = await supabase
      .from("chats")
      .select(`
        id,
        entrepreneur_id,
        project:projects (
          id,
          title,
          company_name,
          investment_status
        ),
        entrepreneur:users!chats_entrepreneur_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        offer:investment_offers (
          id,
          status,
          offer_amount_sar,
          equity_percentage
        ),
        deal:deals (
          id,
          status,
          contact_shared_at
        )
      `)
      .eq("id", chatId)
      .eq("investor_id", appUser.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("المحادثة المطلوبة غير موجودة.");
    }

    const row = data as ChatMetaRow;
    const project = normalizeSingle(row.project);
    const entrepreneur = normalizeSingle(row.entrepreneur);
    const offer = normalizeSingle(row.offer);
    const deal = normalizeSingle(row.deal);

    if (!project?.id) {
      throw new Error("بيانات المشروع المرتبطة بهذه المحادثة غير مكتملة.");
    }

    const mapped: ChatMeta = {
      id: row.id,
      entrepreneurId: row.entrepreneur_id,
      entrepreneurName: entrepreneur?.full_name ?? "رائد أعمال",
      projectId: project.id,
      projectTitle: project.title ?? "مشروع بدون عنوان",
      companyName: project.company_name ?? "جهة غير محددة",
      offerId: offer?.id ?? null,
      dealId: deal?.id ?? null,
    };

    setChatMeta(mapped);
  }, [appUser?.id, chatId]);

  const loadMessages = useCallback(async () => {
    if (!appUser?.id || !chatId) {
      return;
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        id,
        body,
        attachment_url,
        sender_id,
        read_at,
        created_at,
        sender:users!chat_messages_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const mapped = ((data ?? []) as ChatMessageRow[]).map(
      (row: ChatMessageRow): InvestorChatMessage => {
        const sender = normalizeSingle(row.sender);

        return {
          id: row.id,
          body: row.body ?? "",
          attachmentUrl: row.attachment_url,
          senderId: row.sender_id,
          senderName: sender?.full_name ?? "مستخدم",
          readAt: row.read_at,
          createdAt: row.created_at,
        };
      }
    );

    setMessages(mapped);

    await supabase
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .neq("sender_id", appUser.id)
      .is("read_at", null);
  }, [appUser?.id, chatId]);

  useEffect(() => {
    if (!appUser?.id || !chatId) {
      return;
    }

    let mounted = true;

    async function bootstrap() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        await loadChatMeta();
        await loadMessages();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل المحادثة حالياً.";

        if (mounted) {
          setErrorMessage(message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    const channel = supabase
      .channel(`investor-chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async () => {
          try {
            await loadMessages();
          } catch {
            return;
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [appUser?.id, chatId, loadChatMeta, loadMessages]);

  async function handleSendMessage(body: string) {
    if (!appUser?.id || !chatMeta || !chatId) {
      return;
    }

    try {
      setIsSending(true);
      setErrorMessage("");

      const { error: insertMessageError } = await supabase.from("chat_messages").insert({
        chat_id: chatId,
        sender_id: appUser.id,
        body,
        attachment_url: null,
      });

      if (insertMessageError) {
        throw insertMessageError;
      }

      await loadMessages();

      const { error: notificationError } = await supabase.from("notifications").insert({
        recipient_id: chatMeta.entrepreneurId,
        type: "message_received",
        title: "رسالة جديدة",
        body: `لديك رسالة جديدة بخصوص مشروع ${chatMeta.projectTitle}.`,
        ref_type: "chat",
        ref_id: chatMeta.id,
        is_read: false,
      });

      if (notificationError) {
        console.error(notificationError);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "تعذر إرسال الرسالة حالياً.";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSending(false);
    }
  }

  if (isAuthLoading) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>جاري تحميل الجلسة</h2>
          <p>يتم الآن التحقق من بيانات المستثمر.</p>
        </div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>يجب تسجيل الدخول أولاً</h2>
          <p>لا يمكن عرض المحادثة بدون تسجيل الدخول.</p>
          <Link to={ROUTES.auth.signIn} className="btn btn--primary">
            تسجيل الدخول
          </Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>جاري تحميل المحادثة</h2>
          <p>يتم الآن تحميل الرسائل والتفاصيل المرتبطة بالمحادثة.</p>
        </div>
      </section>
    );
  }

  if (errorMessage && !chatMeta) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>تعذر فتح المحادثة</h2>
          <p>{errorMessage}</p>
          <Link to={ROUTES.investor.chats} className="btn btn--primary">
            العودة إلى المحادثات
          </Link>
        </div>
      </section>
    );
  }

  if (!chatMeta) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>المحادثة غير موجودة</h2>
          <p>تعذر العثور على بيانات هذه المحادثة.</p>
          <Link to={ROUTES.investor.chats} className="btn btn--primary">
            العودة إلى المحادثات
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="investor-page">
      <div className="investor-chat-details">
        <div className="investor-chat-details__header">
          <div>
            <Link to={ROUTES.investor.chats} className="investor-chat-details__back">
              ← العودة إلى المحادثات
            </Link>
            <h1 className="investor-page__title">{chatMeta.projectTitle}</h1>
            <p className="investor-page__subtitle">
              {chatMeta.companyName} • {chatMeta.entrepreneurName}
            </p>
          </div>

          <div className="investor-chat-details__actions">
            <Link
              to={ROUTES.investor.projectDetails(chatMeta.projectId)}
              className="btn btn--secondary"
            >
              عرض المشروع
            </Link>

            {chatMeta.offerId ? (
              <Link
                to={ROUTES.investor.offerDetails(chatMeta.offerId)}
                className="btn btn--secondary"
              >
                تفاصيل العرض
              </Link>
            ) : null}

            {chatMeta.dealId ? (
              <Link
                to={ROUTES.investor.dealDetails(chatMeta.dealId)}
                className="btn btn--primary"
              >
                تفاصيل الصفقة
              </Link>
            ) : null}
          </div>
        </div>

        {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

        <div className="investor-chat-shell">
          <InvestorChatWindow
            messages={messages}
            currentUserId={appUser.id}
          />

          <InvestorMessageComposer
            onSend={handleSendMessage}
            isSending={isSending}
          />
        </div>
      </div>
    </section>
  );
}