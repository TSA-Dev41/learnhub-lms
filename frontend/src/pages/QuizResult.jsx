import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
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
        setError(
          err.response?.data?.message || "Unable to load your result."
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api
      .get(`/quizzes/${id}/result`)
      .then((res) => setResult(res.data.data))
      .catch((err) => {
        setError(
          err.response?.data?.message || "Unable to load your result."
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-gray-500">Loading result...</p>;

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600 mb-3">{error}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchResult}
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

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <div
        className={`text-center p-8 rounded-lg mb-6 ${
          result.passed ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <p className="text-4xl font-bold mb-2">{result.score}%</p>
        <p
          className={`font-semibold ${
            result.passed ? "text-green-700" : "text-red-700"
          }`}
        >
          {result.passed ? "You passed! 🎉" : "You didn't pass this time"}
        </p>
      </div>

      <h2 className="text-lg font-bold mb-3">Review Your Answers</h2>
      <div className="space-y-3">
        {result.answers.map((answer, index) => (
          <div
            key={answer._id}
            className={`border rounded p-4 ${
              answer.correct
                ? "border-green-300 bg-green-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <p className="font-medium mb-1">
              {index + 1}. {answer.questionId.text}
            </p>
            <p className="text-sm">
              Your answer:{" "}
              <span className="font-semibold">{answer.selectedOption}</span>
            </p>
            {!answer.correct && (
              <p className="text-sm text-green-700">
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
        className="inline-block mt-6 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      >
        Back to My Courses
      </Link>
    </div>
  );
}