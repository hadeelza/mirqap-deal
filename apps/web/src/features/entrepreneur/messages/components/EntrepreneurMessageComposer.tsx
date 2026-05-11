import { useState } from "react";

type EntrepreneurMessageComposerProps = {
  isSubmitting: boolean;
  onSend: (message: string) => Promise<void>;
};

export default function EntrepreneurMessageComposer({
  isSubmitting,
  onSend,
}: EntrepreneurMessageComposerProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setMessage("");
  }

  return (
    <form className="entrepreneur-message-composer" onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="اكتب رسالتك هنا"
        rows={3}
      />

      <div className="entrepreneur-message-composer__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "جارٍ الإرسال..." : "إرسال"}
        </button>
      </div>
    </form>
  );
}