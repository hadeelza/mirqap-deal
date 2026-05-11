import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import EntrepreneurChatsList, {
  type EntrepreneurChatListItem,
} from "../components/EntrepreneurChatsList";

type ChatRow = {
  id: string;
  project_id: string | null;
  offer_id: string | null;
  deal_id: string | null;
  investor_id: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

type ProjectRow = {
  id: string;
  title: string;
};

type UserRow = {
  id: string;
  full_name: string | null;
};

type OfferLookupRow = {
  id: string;
  project_id: string;
  investor_id: string;
};

type DealLookupRow = {
  id: string;
  project_id: string;
  offer_id: string;
  investor_id: string;
};

export default function EntrepreneurChatsPage() {
  const { appUser, isLoading } = useAuthUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [chats, setChats] = useState<EntrepreneurChatListItem[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isResolvingShortcut, setIsResolvingShortcut] = useState(false);

  useEffect(() => {
    async function resolveShortcutChat() {
      if (!appUser || appUser.role !== "entrepreneur") {
        return;
      }

      const offerId = searchParams.get("offerId");
      const dealId = searchParams.get("dealId");

      if (!offerId && !dealId) {
        return;
      }

      try {
        setIsResolvingShortcut(true);

        if (offerId) {
          const { data: existingChat } = await supabase
            .from("chats")
            .select("id")
            .eq("offer_id", offerId)
            .eq("entrepreneur_id", appUser.id)
            .maybeSingle();

          if (existingChat?.id) {
            navigate(`/entrepreneur/chats/${existingChat.id}`, { replace: true });
            return;
          }

          const { data: offerRow, error: offerError } = await supabase
            .from("investment_offers")
            .select("id,project_id,investor_id")
            .eq("id", offerId)
            .eq("entrepreneur_id", appUser.id)
            .maybeSingle();

          if (offerError) {
            throw offerError;
          }

          if (!offerRow) {
            return;
          }

          const { data: insertedChat, error: insertChatError } = await supabase
            .from("chats")
            .insert({
              project_id: offerRow.project_id,
              offer_id: offerRow.id,
              entrepreneur_id: appUser.id,
              investor_id: offerRow.investor_id,
              created_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (insertChatError) {
            throw insertChatError;
          }

          navigate(`/entrepreneur/chats/${insertedChat.id}`, { replace: true });
          return;
        }

        if (dealId) {
          const { data: existingChat } = await supabase
            .from("chats")
            .select("id")
            .eq("deal_id", dealId)
            .eq("entrepreneur_id", appUser.id)
            .maybeSingle();

          if (existingChat?.id) {
            navigate(`/entrepreneur/chats/${existingChat.id}`, { replace: true });
            return;
          }

          const { data: dealRow, error: dealError } = await supabase
            .from("deals")
            .select("id,project_id,offer_id,investor_id")
            .eq("id", dealId)
            .eq("entrepreneur_id", appUser.id)
            .maybeSingle();

          if (dealError) {
            throw dealError;
          }

          if (!dealRow) {
            return;
          }

          const { data: insertedChat, error: insertChatError } = await supabase
            .from("chats")
            .insert({
              project_id: dealRow.project_id,
              offer_id: dealRow.offer_id,
              deal_id: dealRow.id,
              entrepreneur_id: appUser.id,
              investor_id: dealRow.investor_id,
              created_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (insertChatError) {
            throw insertChatError;
          }

          navigate(`/entrepreneur/chats/${insertedChat.id}`, { replace: true });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر فتح المحادثة المرتبطة حالياً.";
        setErrorMessage(message);
      } finally {
        setIsResolvingShortcut(false);
      }
    }

    void resolveShortcutChat();
  }, [appUser, navigate, searchParams]);

  useEffect(() => {
    async function loadChats() {
      if (!appUser || appUser.role !== "entrepreneur") {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const { data: chatRows, error: chatsError } = await supabase
          .from("chats")
          .select("id,project_id,offer_id,deal_id,investor_id,created_at")
          .eq("entrepreneur_id", appUser.id)
          .order("created_at", { ascending: false });

        if (chatsError) {
          throw chatsError;
        }

        const safeChats = (chatRows ?? []) as ChatRow[];

        if (!safeChats.length) {
          setChats([]);
          return;
        }

        const chatIds = safeChats.map((item: ChatRow) => item.id);
        const projectIds = safeChats
          .map((item: ChatRow) => item.project_id)
          .filter((value: string | null): value is string => Boolean(value));
        const investorIds = safeChats.map((item: ChatRow) => item.investor_id);

        const [{ data: messageRows }, { data: projectRows }, { data: userRows }] = await Promise.all([
          supabase
            .from("chat_messages")
            .select("id,chat_id,sender_id,body,read_at,created_at")
            .in("chat_id", chatIds)
            .order("created_at", { ascending: false }),
          projectIds.length
            ? supabase.from("projects").select("id,title").in("id", projectIds)
            : Promise.resolve({ data: [] as ProjectRow[] }),
          supabase.from("users").select("id,full_name").in("id", investorIds),
        ]);

        const messageList = (messageRows ?? []) as MessageRow[];
        const projectList = (projectRows ?? []) as ProjectRow[];
        const userList = (userRows ?? []) as UserRow[];

        const projectMap = new Map<string, ProjectRow>();
        projectList.forEach((item: ProjectRow) => {
          projectMap.set(item.id, item);
        });

        const userMap = new Map<string, UserRow>();
        userList.forEach((item: UserRow) => {
          userMap.set(item.id, item);
        });

        const latestMessageMap = new Map<string, MessageRow>();
        const unreadCounter = new Map<string, number>();

        messageList.forEach((message: MessageRow) => {
          if (!latestMessageMap.has(message.chat_id)) {
            latestMessageMap.set(message.chat_id, message);
          }

          const isUnread = message.sender_id !== appUser.id && !message.read_at;
          if (isUnread) {
            unreadCounter.set(message.chat_id, (unreadCounter.get(message.chat_id) ?? 0) + 1);
          }
        });

        const mappedChats: EntrepreneurChatListItem[] = safeChats.map((chat: ChatRow) => {
          const latestMessage = latestMessageMap.get(chat.id);

          return {
            id: chat.id,
            projectId: chat.project_id || "",
            projectTitle: chat.project_id
              ? projectMap.get(chat.project_id)?.title || "مشروع"
              : "بدون مشروع",
            investorName: userMap.get(chat.investor_id)?.full_name?.trim() || "مستثمر",
            lastMessage: latestMessage?.body?.trim() || "لا توجد رسالة بعد.",
            lastMessageAt: latestMessage?.created_at || chat.created_at,
            unreadCount: unreadCounter.get(chat.id) ?? 0,
          };
        });

        setChats(mappedChats);
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل المحادثات.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadChats();
  }, [appUser]);

  const filteredChats = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return chats.filter((chat: EntrepreneurChatListItem) => {
      return (
        !normalizedSearch ||
        chat.investorName.toLowerCase().includes(normalizedSearch) ||
        chat.projectTitle.toLowerCase().includes(normalizedSearch) ||
        chat.lastMessage.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [chats, search]);

  if (isLoading || isPageLoading || isResolvingShortcut) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل المحادثات...</div>
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

  return (
    <section className="entrepreneur-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">المحادثات</h1>
          <p className="entrepreneur-page__subtitle">
            جميع محادثاتك مع المستثمرين في مكان واحد.
          </p>
        </div>
      </div>

      <section className="entrepreneur-toolbar">
        <div className="entrepreneur-toolbar__search">
          <label htmlFor="entrepreneur-chats-search">البحث</label>
          <input
            id="entrepreneur-chats-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم المستثمر أو المشروع أو الرسالة"
          />
        </div>
      </section>

      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <EntrepreneurChatsList chats={filteredChats} />
    </section>
  );
}