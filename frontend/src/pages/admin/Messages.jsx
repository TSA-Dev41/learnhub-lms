import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/admin/messages")
      .then((res) => setMessages(res.data.data))
      .catch(() => setError("Unable to load messages."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(load, 0);
    return () => clearTimeout(timeoutId);
  }, [load]);

  const markRead = async (id) => {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      setMessages((current) =>
        current.map((item) => (item._id === id ? { ...item, read: true } : item))
      );
    } catch {
      setError("Could not mark that message as read.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
        Contact messages
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        These come from the public contact form.
      </p>

      {loading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="p-3 rounded-lg flex items-center justify-between gap-3"
          style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
        >
          <span>{error}</span>
          <button onClick={load} className="text-sm font-medium underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No messages yet.</p>
      )}

      {!loading && !error && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((item) => (
            <article
              key={item._id}
              className="rounded-lg p-4 shadow-sm"
              style={{ background: "var(--color-surface)" }}
            >
              <div className="flex justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {item.email}
                  </p>
                </div>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap mb-3">{item.message}</p>
              {item.read ? (
                <span className="text-xs" style={{ color: "var(--color-accent)" }}>
                  Read
                </span>
              ) : (
                <button
                  onClick={() => markRead(item._id)}
                  className="text-xs underline"
                  style={{ color: "var(--color-primary)" }}
                >
                  Mark as read
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
