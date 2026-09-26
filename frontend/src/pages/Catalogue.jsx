import { useState, useEffect, useCallback } from "react";
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

  const loading =
    loadedQuery !== JSON.stringify({ search, category, page });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Course Catalogue</h1>

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
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="border rounded px-3 py-2"
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
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-100 text-red-700 p-3 rounded flex items-center justify-between gap-3">
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
        <p className="text-gray-500">No courses found. Try a different search.</p>
      )}

      {/* Course grid */}
      {!loading && !error && courses.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    page === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white border text-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}