import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState("");

  const fetchCourseData = useCallback(() => {
    setLoading(true);
    setError("");

    Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/lessons`),
      api.get(`/courses/${id}/quizzes`),
    ])
      .then(([courseRes, lessonsRes, quizzesRes]) => {
        setCourse(courseRes.data.data);
        setLessons(lessonsRes.data.data);
        setQuizzes(quizzesRes.data.data);
      })
      .catch(() => setError("Unable to load this course. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCourseData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchCourseData]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setEnrollMessage("");
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrollMessage("You're enrolled! Refresh to access lessons.");
    } catch (err) {
      setEnrollMessage(
        err.response?.data?.message || "Unable to enroll. Please try again."
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-3xl mx-auto">
        <div className="h-6 w-24 rounded skeleton mb-3" />
        <div className="h-9 w-2/3 rounded skeleton mb-4" />
        <div className="h-4 w-full rounded skeleton mb-2" />
        <div className="h-4 w-5/6 rounded skeleton mb-6" />
        <div className="h-10 w-48 rounded-lg skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="mb-3" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
        <button
          onClick={fetchCourseData}
          className="text-sm font-medium underline"
          style={{ color: "var(--color-primary)" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!course) return null;

  const loadedCourseId = course._id ?? course.id;
  if (String(loadedCourseId) !== String(id)) {
    return <p className="p-8" style={{ color: "var(--color-text-muted)" }}>Loading course...</p>;
  }

  const isEnrolled = lessons.some((l) => l.hasAccess);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen p-8 max-w-3xl mx-auto"
    >
      <span
        className="text-xs uppercase tracking-wide font-semibold"
        style={{ color: "var(--color-primary)" }}
      >
        {course.category}
      </span>
      <h1 className="text-3xl font-bold mt-1" style={{ color: "var(--color-text)" }}>
        {course.title}
      </h1>
      <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
        {course.description}
      </p>
      <div className="flex gap-4 text-sm mt-3" style={{ color: "var(--color-text-muted)" }}>
        <span>Instructor: {course.instructor}</span>
        <span className="capitalize">Level: {course.level}</span>
      </div>

      {/* Enroll button / status */}
      <div className="mt-6">
        {!user && (
          <Link
            to="/login"
            className="inline-block text-white px-5 py-2 rounded-lg transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            Log in to Enroll
          </Link>
        )}

        {user && !isEnrolled && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleEnroll}
            disabled={enrolling}
            className="text-white px-5 py-2 rounded-lg disabled:opacity-50 transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            {enrolling ? "Enrolling..." : "Enroll in this Course"}
          </motion.button>
        )}

        {user && isEnrolled && (
          <span
            className="inline-block px-4 py-2 rounded-lg font-medium"
            style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}
          >
            You're enrolled — start learning below
          </span>
        )}

        {enrollMessage && (
          <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
            {enrollMessage}
          </p>
        )}
      </div>

      {/* Lessons list */}
      <h2 className="text-xl font-bold mt-8 mb-3" style={{ color: "var(--color-text)" }}>
        Lessons
      </h2>
      {lessons.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No lessons available yet.</p>
      )}
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="bg-[var(--color-surface)] rounded-lg shadow-sm p-3 flex justify-between items-center"
          >
            <span style={{ color: "var(--color-text)" }}>
              {lesson.order}. {lesson.title}
            </span>
            {lesson.hasAccess ? (
              <Link
                to={`/lessons/${lesson.id}`}
                className="text-sm hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                View lesson
              </Link>
            ) : (
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                🔒 Locked
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-3" style={{ color: "var(--color-text)" }}>
            Quizzes
          </h2>
          <ul className="space-y-2">
            {quizzes.map((quiz) => (
              <li
                key={quiz._id}
                className="bg-[var(--color-surface)] rounded-lg shadow-sm p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium" style={{ color: "var(--color-text)" }}>
                    {quiz.title}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Passing score: {quiz.passingScore}%
                  </p>
                </div>
                {isEnrolled ? (
                  <Link
                    to={`/quizzes/${quiz._id}`}
                    className="text-sm hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Take Quiz
                  </Link>
                ) : (
                  <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    🔒 Enroll to unlock
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}