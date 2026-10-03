import { useState } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm the LearnHub assistant. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");

  const getResponse = (message) => {
    const text = message.toLowerCase();

    if (text.includes("register") || text.includes("account")) {
      return "To create an account, click the Register button and complete the registration form.";
    }

    if (text.includes("course") || text.includes("enroll")) {
      return "You can browse available courses from the Courses page and select a course to view its details.";
    }

    if (text.includes("dashboard")) {
      return "After logging in, you can access your courses and other learning activities from your Dashboard.";
    }

    if (text.includes("quiz")) {
      return "You can take quizzes from the course or lesson area when a quiz is available.";
    }

    if (text.includes("faq") || text.includes("question")) {
      return "You can visit the FAQ page to find answers to common LearnHub questions.";
    }

    if (text.includes("hello") || text.includes("hi")) {
      return "Hello! How can I help you with LearnHub?";
    }

    return "I'm not sure about that yet. Try asking about registration, courses, enrollment, the dashboard, quizzes, or the FAQ.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const botResponse = getResponse(userMessage);

    setMessages((currentMessages) => [
      ...currentMessages,
      { sender: "user", text: userMessage },
      { sender: "bot", text: botResponse },
    ]);

    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 bg-[var(--color-primary)] text-white px-4 py-3 rounded-full shadow-lg hover:opacity-90 transition"
      >
        {isOpen ? "Close Chat" : "Chat"}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-5 w-80 bg-[var(--color-surface)] rounded-xl shadow-xl border overflow-hidden z-50">
          <div className="bg-[var(--color-primary)] text-white px-4 py-3">
            <h2 className="font-semibold">LearnHub Assistant</h2>
            <p className="text-sm opacity-90">
              How can I help you?
            </p>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    message.sender === "user"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 p-3 border-t">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-[var(--color-primary)] text-white px-3 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;