import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Clock } from "lucide-react";

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow";
const labelClass = "block text-sm font-medium mb-1";

const infoItems = [
  { icon: Mail, title: "Email", text: "support@learnhub.example" },
  { icon: MessageCircle, title: "Response time", text: "Usually within 1–2 business days" },
  { icon: Clock, title: "Hours", text: "Mon–Fri, 9am–5pm" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend endpoint exists for this yet — this simulates a successful
    // submission for demo purposes.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="px-8 py-16 text-center"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Get in Touch</h1>
          <p className="text-white/90">We'd love to hear from you.</p>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Info column */}
          <div className="md:col-span-2 space-y-5">
            {infoItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--color-primary-light)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                    {title}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Form column */}
          <div className="md:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg p-8 text-center h-full flex flex-col items-center justify-center"
                style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}
              >
                <p className="font-semibold text-lg mb-1">Message sent!</p>
                <p className="text-sm">Thanks for reaching out - we'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-lg shadow-sm p-6 space-y-4"
                style={{ background: "var(--color-surface)" }}
              >
                <div>
                  <label className={labelClass} style={{ color: "var(--color-text)" }}>
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} style={{ color: "var(--color-text)" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} style={{ color: "var(--color-text)" }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={inputClass}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                  style={{ background: "var(--color-primary)" }}
                >
                  Send Message
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}