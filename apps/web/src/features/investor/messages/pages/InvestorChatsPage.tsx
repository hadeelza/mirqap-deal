import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import InvestorChatsList from "../components/InvestorChatsList";

type MaybeArray<T> = T | T[] | null;

type ChatProjectRow = {
  id: string;
  title: string;
  company_name: string | null;
};

type ChatUserRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ChatMessageRow = {
  id: string;
  body: string | null;
  sender_id: string | null;
  read_at: string | null;
  created_at: string;
};

type ChatRow = {
  id: string;
  created_at: string;
  project: MaybeArray<ChatProjectRow>;
  entrepreneur: MaybeArray<ChatUserRow>;
  messages: ChatMessageRow[] | null;
};

export type InvestorChatListItem = {
  id: string;
  projectId: string;
  projectTitle: string;
  companyName: string;
  entrepreneurName: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
};

function normalizeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getPreviewText(message: ChatMessageRow | null, currentUserId: string): string {
  if (!message?.body?.trim()) {
    return "لا توجد رسائل بعد.";
  }

  const prefix = message.sender_id === currentUserId ? "أنت: " : "";
  return `${prefix}${message.body.trim()}`;
}

export default function InvestorChatsPage() {
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [items, setItems] = useState<InvestorChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadChats() {
      if (!appUser?.id) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("chats")
          .select(`
            id,
            created_at,
            project:projects (
              id,
              title,
              company_name
            ),
            entrepreneur:users!chats_entrepreneur_id_fkey (
              id,
              full_name,
              avatar_url
            ),
            messages:chat_messages (
              id,
              body,
              sender_id,
              read_at,
              created_at
            )
          `)
          .eq("investor_id", appUser.id);

        if (error) {
          throw error;
        }

        const mapped = ((data ?? []) as ChatRow[])
          .map((row: ChatRow): InvestorChatListItem | null => {
            const project = normalizeSingle(row.project);
            const entrepreneur = normalizeSingle(row.entrepreneur);

            if (!project?.id) {
              return null;
            }

            const sortedMessages = [...(row.messages ?? [])].sort(
              (a: ChatMessageRow, b: ChatMessageRow) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            const latestMessage = sortedMessages[0] ?? null;

            return {
              id: row.id,
              projectId: project.id,
              projectTitle: project.title ?? "مشروع بدون عنوان",
              companyName: project.company_name ?? "جهة غير محددة",
              entrepreneurName: entrepreneur?.full_name ?? "رائد أعمال",
              lastMessagePreview: getPreviewText(latestMessage, appUser.id),
              lastMessageAt: latestMessage?.created_at ?? row.created_at,
              unreadCount: (row.messages ?? []).filter(
                (message: ChatMessageRow) =>
                  message.sender_id !== appUser.id && message.read_at === null
              ).length,
            };
          })
          .filter((item: InvestorChatListItem | null): item is InvestorChatListItem => Boolean(item))
          .sort(
            (a: InvestorChatListItem, b: InvestorChatListItem) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );

        setItems(mapped);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل المحادثات حالياً.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadChats();
  }, [appUser?.id]);

  if (isAuthLoading) {
    return (
      <section className="investor-page">
        <div className="investor-page__head">
          <div>
            <h1 className="investor-page__title">المحادثات</h1>
            <p className="investor-page__subtitle">جاري تحميل بيانات المستثمر...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>تعذر الوصول إلى بيانات الحساب</h2>
          <p>يجب تسجيل الدخول أولاً للوصول إلى المحادثات.</p>
          <Link to={ROUTES.auth.signIn} className="btn btn--primary">
            تسجيل الدخول
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="investor-page">
      <div className="investor-page__head">
        <div>
          <h1 className="investor-page__title">المحادثات</h1>
          <p className="investor-page__subtitle">
            جميع محادثاتك مع رواد الأعمال في مكان واحد.
          </p>
        </div>

        <div className="investor-page__actions">
          <Link to={ROUTES.investor.explore} className="btn btn--secondary">
            استكشاف المشاريع
          </Link>
        </div>
      </div>

      <InvestorChatsList
        items={items}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </section>
  );
}