import { useState } from "react";

type InvestorMessageComposerProps = {
  onSend: (body: string) => Promise<void>;
  isSending: boolean;
};

export default function InvestorMessageComposer({
  onSend,
  isSending,
}: InvestorMessageComposerProps) {
  const [body, setBody] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = body.trim();

    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setBody("");
  }

  return (
    <form className="investor-message-composer" onSubmit={handleSubmit}>
      <div className="investor-message-composer__field">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="اكتب رسالتك هنا..."
          rows={4}
          disabled={isSending}
        />
      </div>

      <div className="investor-message-composer__actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSending || !body.trim()}
        >
          {isSending ? "جاري الإرسال..." : "إرسال الرسالة"}
        </button>
      </div>
    </form>
  );
}