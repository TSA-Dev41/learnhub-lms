import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

  if (loading) return <p className="p-8 text-gray-500">Loading quiz...</p>;

  if (error && !quiz) {
    return (
      <div className="p-8">
        <p className="text-red-600 mb-3">{error}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchQuiz}
            className="text-sm font-medium text-blue-600 underline"
          >
            Retry
          </button>
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{quiz.title}</h1>
      {quiz.description && (
        <p className="text-gray-600 mb-6">{quiz.description}</p>
      )}
      <p className="text-sm text-gray-500 mb-6">
        Passing score: {quiz.passingScore}%
      </p>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
      )}

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="bg-white border rounded p-5">
            <p className="font-semibold mb-3">
              {index + 1}. {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer ${
                    answers[question.id] === option
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => selectAnswer(question.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>

      {!allAnswered && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Answer all questions to submit.
        </p>
      )}
    </div>
  );
}