import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import api from "../services/api";
import {
  faqEntries,
  matchSmallTalk,
  matchFaqIntents,
  matchFollowUp,
  getFaqAnswer,
  getSmallTalkAnswer,
  getFallback,
  detectCourseQuery,
} from "../data/chatbotResponses";

const GREETING = {
  sender: "bot",
  text: "Hi! I'm the LearnHub assistant. Ask me anything about courses, enrollment, quizzes — or try \"do you have any courses on design?\"",
};

const SUGGESTED = faqEntries.slice(0, 4);

async function processMessage(userText, lastTopicId) {
  // 1. Small talk first — greetings/thanks shouldn't trigger a course search.
  const smallTalkMatch = matchSmallTalk(userText);
  if (smallTalkMatch) {
    return { text: getSmallTalkAnswer(smallTalkMatch), topicId: lastTopicId };
  }

  // 2. Real course lookups against LearnHub's own backend.
  const courseQuery = detectCourseQuery(userText);
  if (courseQuery) {
    try {
      if (courseQuery.type === "categories") {
        const res = await api.get("/courses/categories");
        const categories = res.data.data;
        return {
          text: categories.length
            ? `We currently have courses in: ${categories.join(", ")}.`
            : "I couldn't find any course categories right now — try browsing the catalogue directly.",
          topicId: null,
        };
      }

      const res = await api.get("/courses", {
        params: { search: courseQuery.query || undefined, limit: 5 },
      });
      const courses = res.data.data;

      if (courses.length === 0) {
        return {
          text: courseQuery.query
            ? `I couldn't find any courses matching "${courseQuery.query}" right now. Try browsing the full catalogue instead.`
            : "I couldn't load courses right now — try the catalogue page directly.",
          topicId: null,
        };
      }

      return {
        text: courseQuery.query
          ? `Here's what I found for "${courseQuery.query}":`
          : "Here are some courses we currently offer:",
        courses,
        topicId: null,
      };
    } catch {
      return {
        text: "Sorry, I couldn't reach the course catalogue just now — try browsing courses directly.",
        topicId: null,
      };
    }
  }

  // 3. FAQ matching (can return up to 2 combined topics).
  const faqMatches = matchFaqIntents(userText);
  if (faqMatches.length > 0) {
    const text =
      faqMatches.length === 1
        ? getFaqAnswer(faqMatches[0])
        : `${getFaqAnswer(faqMatches[0])} Also — ${getFaqAnswer(faqMatches[1]).charAt(0).toLowerCase()}${getFaqAnswer(faqMatches[1]).slice(1)}`;
    return { text, topicId: faqMatches[0].id };
  }

  // 4. Context-aware follow-up: short message, no clear match on its own,
  // but there's a previous topic to continue.
  if (lastTopicId) {
    const followUp = matchFollowUp(userText, lastTopicId);
    if (followUp) {
      return { text: getFaqAnswer(followUp), topicId: followUp.id };
    }
  }

  // 5. Give up gracefully.
  return { text: getFallback(), topicId: lastTopicId };
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastTopicId, setLastTopicId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const runBotReply = async (userText) => {
    setTyping(true);
    const result = await processMessage(userText, lastTopicId);
    setLastTopicId(result.topicId ?? null);
    // Small delay so it doesn't feel instantaneous/robotic even though the
    // course lookup (when it happens) is already an async network call.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: result.text, courses: result.courses },
      ]);
      setTyping(false);
    }, 300);
  };

  const handleChipClick = (entry) => {
    setMessages((prev) => [...prev, { sender: "user", text: entry.label }]);
    runBotReply(entry.label);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setInput("");
    runBotReply(trimmed);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="mb-3 w-80 max-w-[calc(100vw-3rem)] rounded-lg shadow-md flex flex-col overflow-hidden"
            style={{ background: "var(--color-surface)", height: 440 }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between shrink-0"
              style={{ background: "var(--color-primary)" }}
            >
              <p className="text-white font-semibold text-sm">LearnHub Assistant</p>
              <button onClick={() => setOpen(false)} aria-label="Close chat">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="rounded-lg px-3 py-2 text-sm max-w-[85%]"
                    style={
                      msg.sender === "user"
                        ? { background: "var(--color-primary)", color: "#fff" }
                        : { background: "var(--color-bg)", color: "var(--color-text)" }
                    }
                  >
                    <p>{msg.text}</p>
                    {msg.courses && (
                      <div className="mt-2 space-y-1">
                        {msg.courses.map((c) => (
                          <Link
                            key={c._id}
                            to={`/courses/${c._id}`}
                            className="block text-xs rounded-md px-2 py-1.5 font-medium hover:underline"
                            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
                          >
                            {c.title} · {c.category}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-3 py-2 flex gap-1" style={{ background: "var(--color-bg)" }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--color-text-muted)" }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTED.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleChipClick(entry)}
                      className="text-xs px-2.5 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                      style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 rounded-lg px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <button
                type="submit"
                className="rounded-lg px-3 flex items-center justify-center transition-colors"
                style={{ background: "var(--color-primary)" }}
                aria-label="Send"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full shadow-md flex items-center justify-center"
        style={{ background: "var(--color-primary)" }}
        aria-label="Open chat"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </motion.button>
    </div>
  );
}