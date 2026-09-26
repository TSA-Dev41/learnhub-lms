import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import CourseCard from "../components/CourseCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/courses", { params: { page: 1, limit: 6 } })
      .then((res) => setFeatured(res.data.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-8 py-24 text-center"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        }}
      >
        {/* Decorative animated blobs — purely visual, aria-hidden */}
        <div
          aria-hidden="true"
          className="hero-blob-1 absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--color-accent)" }}
        />
        <div
          aria-hidden="true"
          className="hero-blob-2 absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "#ffffff" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-2xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Learn new skills, on your schedule
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Browse hands-on courses in web development, data science, design and more -
            taught at your own pace.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/courses"
              className="inline-block bg-white px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
              style={{ color: "var(--color-primary)" }}
            >
              Browse Courses
            </Link>
            <Link
              to="/register"
              className="inline-block border border-white/40 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured courses */}
      <section className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Featured Courses
          </h2>
          <Link
            to="/courses"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg skeleton" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featured.map((course) => (
              <motion.div
                key={course._id}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}