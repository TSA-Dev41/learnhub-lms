import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

const emptyQuizForm = {
  title: "",
  description: "",
  passingScore: 70,
  timeLimit: 0,
  status: "draft",
};

const emptyQuestionForm = {
  text: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 1,
};

export default function ManageQuizzes() {
  const { id: courseId } = useParams();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quizForm, setQuizForm] = useState(emptyQuizForm);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const [activeQuiz, setActiveQuiz] = useState(null); // full quiz+questions being managed
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/quizzes/course/${courseId}`);
      setQuizzes(res.data.data);
    } catch {
      setError("Unable to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadQuizzes = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/quizzes/course/${courseId}`);
        if (isActive) setQuizzes(res.data.data);
      } catch {
        if (isActive) setError("Unable to load quizzes.");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadQuizzes();

    return () => {
      isActive = false;
    };
  }, [courseId]);

  // ---- Quiz form ----
  const handleQuizChange = (e) => {
    setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  };

  const startEditQuiz = (quiz) => {
    setEditingQuizId(quiz._id);
    setQuizForm({
      title: quiz.title || "",
      description: quiz.description || "",
      passingScore: quiz.passingScore ?? 70,
      timeLimit: quiz.timeLimit ?? 0,
      status: quiz.status || "draft",
    });
  };

  const cancelEditQuiz = () => {
    setEditingQuizId(null);
    setQuizForm(emptyQuizForm);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setSubmittingQuiz(true);
    setError("");
    try {
      if (editingQuizId) {
        await api.put(`/admin/quizzes/${editingQuizId}`, quizForm);
      } else {
        await api.post(`/admin/quizzes`, { ...quizForm, course: courseId });
      }
      cancelEditQuiz();
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save quiz.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm("Delete this quiz and all its questions? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      if (activeQuiz?.id === quizId) setActiveQuiz(null);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete quiz.");
    }
  };

  // ---- Questions ----
  const openQuestionManager = (quizId) => {
    api
      .get(`/admin/quizzes/${quizId}`)
      .then((res) => setActiveQuiz(res.data.data))
      .catch(() => setError("Unable to load quiz questions."));
  };

  const closeQuestionManager = () => {
    setActiveQuiz(null);
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestionForm);
  };

  const refreshActiveQuiz = () => {
    if (activeQuiz) openQuestionManager(activeQuiz.id);
  };

  const handleOptionChange = (index, value) => {
    const options = [...questionForm.options];
    options[index] = value;
    setQuestionForm({ ...questionForm, options });
  };

  const startEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
    });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestionForm);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingQuestion(true);
    setError("");
    try {
      const cleanOptions = questionForm.options.filter((o) => o.trim() !== "");
      const payload = { ...questionForm, options: cleanOptions };

      if (editingQuestionId) {
        await api.put(`/admin/questions/${editingQuestionId}`, payload);
      } else {
        await api.post(`/admin/quizzes/${activeQuiz.id}/questions`, payload);
      }
      cancelEditQuestion();
      refreshActiveQuiz();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save question.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Delete this question?")) return;
    try {
      await api.delete(`/admin/questions/${questionId}`);
      refreshActiveQuiz();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete question.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Quizzes</h1>
        <Link to="/admin/courses" className="text-blue-600 hover:underline text-sm">
          ← Back to Courses
        </Link>
      </div>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
      )}

      {/* Quiz list */}
      {loading ? (
        <p className="text-gray-500">Loading quizzes...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Passing Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz._id} className="border-t">
                  <td className="p-3 font-medium">{quiz.title}</td>
                  <td className="p-3">{quiz.passingScore}%</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        quiz.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => openQuestionManager(quiz._id)}
                      className="text-purple-600 hover:underline"
                    >
                      Questions
                    </button>
                    <button
                      onClick={() => startEditQuiz(quiz)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No quizzes yet. Add one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit quiz form */}
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mb-8">
        <h2 className="text-lg font-bold mb-4">
          {editingQuizId ? "Edit Quiz" : "Add New Quiz"}
        </h2>
        <form onSubmit={handleQuizSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={quizForm.title}
              onChange={handleQuizChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              name="description"
              value={quizForm.description}
              onChange={handleQuizChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                name="passingScore"
                value={quizForm.passingScore}
                onChange={handleQuizChange}
                min={0}
                max={100}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Time Limit (minutes, 0 = none)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={quizForm.timeLimit}
                onChange={handleQuizChange}
                min={0}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={quizForm.status}
              onChange={handleQuizChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submittingQuiz}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submittingQuiz ? "Saving..." : editingQuizId ? "Save Changes" : "Add Quiz"}
            </button>
            {editingQuizId && (
              <button
                type="button"
                onClick={cancelEditQuiz}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Question manager for active quiz */}
      {activeQuiz && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              Questions — {activeQuiz.title}
            </h2>
            <button
              onClick={closeQuestionManager}
              className="text-sm text-gray-500 hover:underline"
            >
              Close
            </button>
          </div>

          <ul className="space-y-2 mb-6">
            {activeQuiz.questions.map((q) => (
              <li
                key={q.id}
                className="border rounded p-3 flex justify-between items-start"
              >
                <div>
                  <p className="font-medium">{q.text}</p>
                  <p className="text-xs text-gray-500">
                    Options: {q.options.join(", ")} — Correct: {q.correctAnswer} — {q.points} pt(s)
                  </p>
                </div>
                <div className="space-x-2 shrink-0">
                  <button
                    onClick={() => startEditQuestion(q)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {activeQuiz.questions.length === 0 && (
              <p className="text-gray-500 text-sm">No questions yet.</p>
            )}
          </ul>

          <h3 className="font-bold mb-3">
            {editingQuestionId ? "Edit Question" : "Add Question"}
          </h3>
          <form onSubmit={handleQuestionSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Question Text
              </label>
              <input
                value={questionForm.text}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, text: e.target.value })
                }
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {questionForm.options.map((opt, i) => (
              <div key={i}>
                <label className="block text-sm font-medium mb-1">
                  Option {i + 1}
                </label>
                <input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1">
                Correct Answer (must exactly match one option)
              </label>
              <input
                value={questionForm.correctAnswer}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    correctAnswer: e.target.value,
                  })
                }
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Points</label>
              <input
                type="number"
                value={questionForm.points}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, points: e.target.value })
                }
                min={1}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submittingQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingQuestion
                  ? "Saving..."
                  : editingQuestionId
                  ? "Save Changes"
                  : "Add Question"}
              </button>
              {editingQuestionId && (
                <button
                  type="button"
                  onClick={cancelEditQuestion}
                  className="px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}