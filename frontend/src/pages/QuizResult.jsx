import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

export default function QuizResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResult = useCallback(() => {
    setLoading(true);
    setError("");

    api
      .get(`/quizzes/${id}/result`)
      .then((res) => setResult(res.data.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load your result.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <div className="h-32 w-full rounded-lg skeleton mb-6" />
        <div className="h-6 w-1/3 rounded skeleton mb-3" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 w-full rounded-lg skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="mb-3" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchResult}
            className="text-sm font-medium underline"
            style={{ color: "var(--color-primary)" }}
          >
            Retry
          </button>
          <Link to="/" className="hover:underline text-sm" style={{ color: "var(--color-primary)" }}>
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen p-8 max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="text-center p-8 rounded-lg mb-6"
        style={{
          background: result.passed
            ? "var(--color-accent-light)"
            : "var(--color-danger-light)",
        }}
      >
        <p className="text-4xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          {result.score}%
        </p>
        <p
          className="font-semibold"
          style={{
            color: result.passed ? "var(--color-accent)" : "var(--color-danger)",
          }}
        >
          {result.passed ? "You passed! 🎉" : "You didn't pass this time"}
        </p>
      </motion.div>

      <h2 className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>
        Review Your Answers
      </h2>
      <div className="space-y-3">
        {result.answers.map((answer, index) => (
          <div
            key={answer._id}
            className="rounded-lg shadow-sm p-4"
            style={{
              background: answer.correct
                ? "var(--color-accent-light)"
                : "var(--color-danger-light)",
            }}
          >
            <p className="font-medium mb-1" style={{ color: "var(--color-text)" }}>
              {index + 1}. {answer.questionId.text}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              Your answer:{" "}
              <span className="font-semibold">{answer.selectedOption}</span>
            </p>
            {!answer.correct && (
              <p className="text-sm" style={{ color: "var(--color-accent)" }}>
                Correct answer:{" "}
                <span className="font-semibold">
                  {answer.questionId.correctAnswer}
                </span>
              </p>
            )}
          </div>
        ))}
      </div>

      <Link
        to="/dashboard"
        className="inline-block mt-6 text-white px-5 py-2 rounded-lg transition-colors"
        style={{ background: "var(--color-primary)" }}
      >
        Back to My Courses
      </Link>
    </motion.div>
  );
}