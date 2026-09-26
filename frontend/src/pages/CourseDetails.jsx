import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
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
    return <p className="p-8 text-gray-500">Loading course...</p>;
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={fetchCourseData}
          className="text-sm font-medium text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!course) return null;

  const loadedCourseId = course._id ?? course.id;
  if (String(loadedCourseId) !== String(id)) {
    return <p className="p-8 text-gray-500">Loading course...</p>;
  }

  const isEnrolled = lessons.some((l) => l.hasAccess);

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
        {course.category}
      </span>
      <h1 className="text-3xl font-bold mt-1">{course.title}</h1>
      <p className="text-gray-600 mt-2">{course.description}</p>
      <div className="flex gap-4 text-sm text-gray-500 mt-3">
        <span>Instructor: {course.instructor}</span>
        <span className="capitalize">Level: {course.level}</span>
      </div>

      {/* Enroll button / status */}
      <div className="mt-6">
        {!user && (
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Log in to Enroll
          </Link>
        )}

        {user && !isEnrolled && (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {enrolling ? "Enrolling..." : "Enroll in this Course"}
          </button>
        )}

        {user && isEnrolled && (
          <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded">
            You're enrolled — start learning below
          </span>
        )}

        {enrollMessage && (
          <p className="text-sm mt-2 text-gray-600">{enrollMessage}</p>
        )}
      </div>

      {/* Lessons list */}
      <h2 className="text-xl font-bold mt-8 mb-3">Lessons</h2>
      {lessons.length === 0 && (
        <p className="text-gray-500">No lessons available yet.</p>
      )}
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="bg-white border rounded p-3 flex justify-between items-center"
          >
            <span>
              {lesson.order}. {lesson.title}
            </span>
            {lesson.hasAccess ? (
              <Link
                to={`/lessons/${lesson.id}`}
                className="text-blue-600 text-sm hover:underline"
              >
                View lesson
              </Link>
            ) : (
              <span className="text-gray-400 text-sm">🔒 Locked</span>
            )}
          </li>
        ))}
      </ul>

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-3">Quizzes</h2>
          <ul className="space-y-2">
            {quizzes.map((quiz) => (
              <li
                key={quiz._id}
                className="bg-white border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{quiz.title}</p>
                  <p className="text-sm text-gray-500">
                    Passing score: {quiz.passingScore}%
                  </p>
                </div>
                {isEnrolled ? (
                  <Link
                    to={`/quizzes/${quiz._id}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Take Quiz
                  </Link>
                ) : (
                  <span className="text-gray-400 text-sm">
                    🔒 Enroll to unlock
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}