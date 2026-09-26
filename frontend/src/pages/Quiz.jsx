import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchQuiz = useCallback(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    setQuiz(null);

    api
      .get(`/quizzes/${id}`)
      .then((res) => {
        if (!cancelled) setQuiz(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load this quiz. Please try again."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cleanup;
    const timeoutId = setTimeout(() => {
      cleanup = fetchQuiz();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      cleanup?.();
    };
  }, [fetchQuiz]);

  const selectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedOption]) => ({ questionId, selectedOption })
    );

    try {
      await api.post(`/quizzes/${id}/submit`, { answers: formattedAnswers });
      navigate(`/quizzes/${id}/result`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to submit quiz. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <div className="h-8 w-1/2 rounded skeleton mb-3" />
        <div className="h-4 w-1/3 rounded skeleton mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 w-full rounded-lg skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="p-8">
        <p className="mb-3" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchQuiz}
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

  if (!quiz) return null;

  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen p-8 max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
        {quiz.title}
      </h1>
      {quiz.description && (
        <p className="mb-6" style={{ color: "var(--color-text-muted)" }}>
          {quiz.description}
        </p>
      )}
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        Passing score: {quiz.passingScore}%
      </p>

      {error && (
        <p
          className="p-3 rounded-lg mb-4"
          style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
        >
          {error}
        </p>
      )}

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div
            key={question.id}
            className="bg-[var(--color-surface)] rounded-lg shadow-sm p-5"
          >
            <p className="font-semibold mb-3" style={{ color: "var(--color-text)" }}>
              {index + 1}. {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((option) => {
                const selected = answers[question.id] === option;
                return (
                  <motion.label
                    key={option}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer border transition-colors"
                    style={
                      selected
                        ? {
                            borderColor: "var(--color-primary)",
                            background: "var(--color-primary-light)",
                          }
                        : { borderColor: "#e5e7eb" }
                    }
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={selected}
                      onChange={() => selectAnswer(question.id, option)}
                    />
                    <span style={{ color: "var(--color-text)" }}>{option}</span>
                  </motion.label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="mt-6 w-full text-white py-3 rounded-lg disabled:opacity-50 transition-colors"
        style={{ background: "var(--color-primary)" }}
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </motion.button>

      {!allAnswered && (
        <p className="text-sm mt-2 text-center" style={{ color: "var(--color-text-muted)" }}>
          Answer all questions to submit.
        </p>
      )}
    </motion.div>
  );
}