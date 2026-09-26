import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Users, Award, Zap, Target, Layers } from "lucide-react";
import api from "../services/api";

const values = [
  {
    icon: Zap,
    title: "Self-paced learning",
    text: "Work through lessons whenever suits you — no fixed schedules, no pressure.",
  },
  {
    icon: Award,
    title: "Real feedback",
    text: "Quizzes are scored instantly, with a full breakdown of what you got right and wrong.",
  },
  {
    icon: Target,
    title: "Track your progress",
    text: "See exactly how far you've come in every course you're enrolled in, at a glance.",
  },
];

export default function About() {
  const [stats, setStats] = useState({ courses: null, categories: null });

  useEffect(() => {
    api
      .get("/courses", { params: { limit: 100 } })
      .then((res) => {
        const courses = res.data.data;
        const categories = new Set(courses.map((c) => c.category));
        setStats({ courses: courses.length, categories: categories.size });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="px-8 py-20 text-center"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-white mb-4">About LearnHub</h1>
          <p className="text-lg text-white/90">
            A focused, no-friction place to learn - built as a TSAcademy capstone
            project, designed like a product students would actually want to use.
          </p>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="max-w-4xl mx-auto px-8 -mt-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-3 rounded-lg shadow-md overflow-hidden"
          style={{ background: "var(--color-surface)" }}
        >
          {[
            { icon: BookOpen, label: "Courses", value: stats.courses },
            { icon: Layers, label: "Categories", value: stats.categories },
            { icon: Users, label: "Roles supported", value: 2 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-6 text-center border-r last:border-r-0 border-gray-100">
              <Icon
                className="w-6 h-6 mx-auto mb-2"
                style={{ color: "var(--color-primary)" }}
              />
              <p className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                {value ?? "—"}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
          Why LearnHub
        </h2>
        <p style={{ color: "var(--color-text-muted)" }}>
          Most learning platforms bury students in features they don't need. LearnHub
          strips things back to what actually matters: clear courses, structured
          lessons and quizzes that tell you honestly whether you've understood the
          material - wrapped in an interface that gets out of your way.
        </p>
      </section>

      {/* Values grid */}
      <section className="max-w-5xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, text }) => (
            <motion.div
              key={title}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg shadow-sm p-6"
              style={{ background: "var(--color-surface)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "var(--color-primary-light)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "var(--color-text)" }}>
                {title}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="max-w-3xl mx-auto px-8 pb-16">
        <div
          className="rounded-lg shadow-sm p-8 text-center"
          style={{ background: "var(--color-surface)" }}
        >
          <h2 className="text-lg font-bold mb-5" style={{ color: "var(--color-text)" }}>
            Built With
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["React", "Node.js", "Express", "MongoDB"].map((tech) => (
              <div
                key={tech}
                className="py-2.5 rounded-lg font-medium text-sm"
                style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-20">
        <Link
          to="/courses"
          className="inline-block text-white px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
          style={{ background: "var(--color-primary)" }}
        >
          Browse Courses
        </Link>
      </section>
    </div>
  );
}