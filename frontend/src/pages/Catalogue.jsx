import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import CourseCard from "../components/CourseCard";

export default function Catalogue() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loadedQuery, setLoadedQuery] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories once
  useEffect(() => {
    api
      .get("/courses/categories")
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  const fetchCourses = useCallback(() => {
    const params = { page, limit: 9 };
    if (search) params.search = search;
    if (category) params.category = category;
    const queryKey = JSON.stringify({ search, category, page });

    setError("");

    api
      .get("/courses", { params })
      .then((res) => {
        setCourses(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch(() => setError("Unable to load courses. Please try again."))
      .finally(() => setLoadedQuery(queryKey));
  }, [search, category, page]);

  // Fetch courses whenever search/category/page changes
  useEffect(() => {
    const timeoutId = setTimeout(fetchCourses, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchCourses]);

  const loading = loadedQuery !== JSON.stringify({ search, category, page });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen p-8"
    >
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Course Catalogue
      </h1>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 flex-1 bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-lg skeleton" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          className="p-3 rounded-lg flex items-center justify-between gap-3"
          style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
        >
          <span>{error}</span>
          <button
            onClick={fetchCourses}
            className="text-sm font-medium underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && courses.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>
          No courses found. Try a different search.
        </p>
      )}

      {/* Course grid */}
      {!loading && !error && courses.length > 0 && (
        <>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.map((course) => (
              <motion.div
                key={course._id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    page === i + 1
                      ? "text-white"
                      : "bg-[var(--color-surface)] border border-gray-200"
                  }`}
                  style={
                    page === i + 1
                      ? { background: "var(--color-primary)" }
                      : { color: "var(--color-text-muted)" }
                  }
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}